from datetime import datetime, timedelta
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Meeting
from .serializers import MeetingSerializer
import json
from firebase_admin import firestore
from collections import Counter
from authapp.gmail_utils import send_email, format_email_body, format_email_subject, send_email_with_ics, create_or_update_calendar_event
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from zoneinfo import ZoneInfo

from pytz import timezone, UTC

import logging

logger = logging.getLogger(__name__)

db = firestore.client()


def calculate_end_time(start_time_iso, duration):
    try:
        duration = float(duration)  # Ensure duration is numeric
        start_time = datetime.fromisoformat(start_time_iso)
        return start_time + timedelta(hours=duration)
    except Exception as e:
        logger.error(f"Error in calculate_end_time: {e}")
        raise

def generate_ics_file(event_name, start_time, end_time, location, description, organizer, attendees, event_id):
    attendees_str = "\n".join([
        f"ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN={attendee}:mailto:{attendee}" 
        for attendee in attendees
    ])
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Meeting Scheduler//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:{start_time.strftime('%Y%m%dT%H%M%S')}
DTEND:{end_time.strftime('%Y%m%dT%H%M%S')}
DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%S')}
ORGANIZER;CN={organizer}:mailto:{organizer}
UID:{event_id}  # Use the provided event_id as the unique identifier
CREATED:{datetime.now().strftime('%Y%m%dT%H%M%S')}
DESCRIPTION:{description}
LAST-MODIFIED:{datetime.now().strftime('%Y%m%dT%H%M%S')}
LOCATION:{location}
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:{event_name}
TRANSP:OPAQUE
{attendees_str}
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR
"""
    return ics_content

class CreateMeetingAPIView(APIView):
    def post(self, request):
        try:
            body = request.data
            profile_id = body.get("profile_id")

            required_fields = ['name', 'agenda', 'attendees', 'proposed_dates', 'poll_deadline']
            for field in required_fields:
                if field not in body:
                    return JsonResponse({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Prepare meeting data
            meeting_data = {
                "name": body.get("name"),
                "agenda": body.get("agenda"),
                "attendees": [{"email": email, "status": "invited", "response": None} for email in body.get("attendees")],
                "proposed_dates": body.get("proposed_dates"),
                "duration": body.get("duration"),
                "finalized_date": None,
                "finalized": False,
                "location": body.get("location", ""),
                "creation_date": datetime.now(),
                "assigned_by": profile_id,
                "poll_deadline": body.get("poll_deadline")
            }

            # Save meeting data to Firestore
            doc_ref = db.collection("meetings").document()  
            meeting_data["meetingId"] = doc_ref.id  
            poll_link = f"https://pookie-rookies.web.app/poll/{doc_ref.id}" 
            meeting_data["poll_link"] = poll_link

            doc_ref.set(meeting_data)

            # Convert times to SGT for frontend display
            meeting_data["creation_date"] = meeting_data["creation_date"]
            meeting_data["poll_deadline"] = meeting_data["poll_deadline"]

            # Return the meeting creation response
            return JsonResponse({"message": "Meeting created successfully", "meeting": meeting_data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class MeetingListAPIView(APIView):
    def get(self, request, profile_id):
        try:
            meetings_ref = db.collection("meetings").where("assigned_by", "==", profile_id)
            meetings = meetings_ref.stream()

            meetings_list = []
            for meeting in meetings:
                meeting_data = meeting.to_dict()
                # Convert times to SGT for frontend display
                if meeting_data.get("creation_date"):
                    meeting_data["creation_date"] = meeting_data["creation_date"]
                if meeting_data.get("poll_deadline"):
                    meeting_data["poll_deadline"] = meeting_data["poll_deadline"]
                if meeting_data.get("finalized_date"):
                    meeting_data["finalized_date"] = meeting_data["finalized_date"]
                meetings_list.append(meeting_data)

            return Response(meetings_list)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MeetingDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            meeting_ref = db.collection("meetings").document(pk)
            meeting = meeting_ref.get()

            if meeting.exists:
                meeting_data = meeting.to_dict()
                # Convert times to SGT for frontend display
                if meeting_data.get("creation_date"):
                    meeting_data["creation_date"] = meeting_data["creation_date"]
                if meeting_data.get("poll_deadline"):
                    meeting_data["poll_deadline"] = meeting_data["poll_deadline"]
                if meeting_data.get("finalized_date"):
                    meeting_data["finalized_date"] = meeting_data["finalized_date"]
                return Response(meeting_data)
            else:
                return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EditMeetingAPIView(APIView):
    def put(self, request, pk):
        try:
            # Fetch the meeting data
            meeting_ref = db.collection("meetings").document(pk)
            meeting = meeting_ref.get()
            
            if not meeting.exists:
                return JsonResponse({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            body = request.data
            meeting_data = meeting.to_dict()
            user_id = body.get("user_id")

            # Fetch the user profile
            user_ref = db.collection("profiles").document(user_id)
            user_profile = user_ref.get()

            if not user_profile.exists:
                return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            sender_name = user_profile.to_dict().get("name")
            sender_email = user_profile.to_dict().get("email")

            # Update meeting data
            for key, value in body.items():
                if key != "user_id":
                    meeting_data[key] = value

            # Convert date fields to UTC for storage
            if "poll_deadline" in body:
                meeting_data["poll_deadline"] = datetime.fromisoformat(body["poll_deadline"]).isoformat()
            if "finalized_date" in body:
                meeting_data["finalized_date"] = datetime.fromisoformat(body["finalized_date"]).isoformat()

            # Update the meeting in Firestore
            meeting_ref.update(meeting_data)

            if meeting_data.get("finalized"):
                start_time = datetime.fromisoformat(meeting_data["finalized_date"])
                duration = meeting_data.get("duration")
                end_time = calculate_end_time(start_time.isoformat(), duration)
                location = meeting_data.get("location", "")
                agenda = meeting_data.get("agenda", "")
                attendees_emails = [attendee["email"] for attendee in meeting_data["attendees"]]

                start_time_sgt = (start_time)
                end_time_sgt = (end_time)

                # Fetch or create the eventId
                event_id = meeting_data.get("event_id")

                # Update the event in Google Calendar
                updated_event_id = create_or_update_calendar_event(
                    sender_email,
                    meeting_data["name"],
                    start_time_sgt,
                    end_time_sgt,
                    location,
                    agenda,
                    attendees_emails,
                    event_id  # Pass the existing event_id if available
                )

                # Store the eventId if it was created or updated
                meeting_data["event_id"] = updated_event_id
                meeting_ref.update({"event_id": updated_event_id})

                # Generate and send updated ICS file
                ics_content = generate_ics_file(
                    meeting_data["name"],
                    start_time,
                    end_time,
                    location,
                    agenda,
                    sender_email,
                    attendees_emails
                )

                for email in attendees_emails:
                    send_email_with_ics(
                        sender=sender_email,
                        to=email,
                        subject=f"Updated Meeting Details: {meeting_data['name']}",
                        body=f"""
Hi,

The meeting '{meeting_data['name']}' has been updated. Please find the new details below:

- Date: {start_time_sgt.strftime("%d %B %Y")}
- Start Time: {start_time_sgt.strftime("%I:%M %p")} SGT
- End Time: {end_time_sgt.strftime('%I:%M %p')} SGT
- Location: {location}
- Agenda: {agenda}

The updated calendar invite is attached.

Best Regards,
{sender_name}
                        """,
                        ics_content=ics_content
                    )

            # Convert times to SGT for frontend display
            if meeting_data.get("creation_date"):
                meeting_data["creation_date"] = (datetime.fromisoformat(meeting_data["creation_date"])).isoformat()
            if meeting_data.get("poll_deadline"):
                meeting_data["poll_deadline"] = (datetime.fromisoformat(meeting_data["poll_deadline"])).isoformat()
            if meeting_data.get("finalized_date"):
                meeting_data["finalized_date"] = (datetime.fromisoformat(meeting_data["finalized_date"])).isoformat()

            return JsonResponse({"message": "Meeting details updated and notifications sent with updated calendar invites.", "meeting": meeting_data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("An error occurred while updating the meeting")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteMeetingAPIView(APIView):
    def delete(self, request, pk):
        try:
            meeting_ref = db.collection("meetings").document(pk)
            meeting = meeting_ref.get()

            if not meeting.exists:
                return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            meeting_ref.delete()

            return JsonResponse({"message": "Meeting deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class SendEmailPollsAPIView(APIView):
    def post(self, request):
        print(f"Request received: {request.method} - {request.data}")
        try:
            body = request.data
            logger.info(f"Request body: {body}")

            meeting_id = body.get("meetingId")  
            user_id = body.get("userId")

            logger.info(f"Extracted meeting_id: {meeting_id}, user_id: {user_id}")

            user_ref = db.collection("profiles").document(user_id)
            user_profile = user_ref.get()

            if not user_profile.exists:
                logger.error("User not found")
                return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            sender_email = user_profile.to_dict().get("email")
            sender_name = user_profile.to_dict().get("name")

            meeting_ref = db.collection("meetings").document(meeting_id)
            meeting = meeting_ref.get()

            if not meeting.exists:
                logger.error("Meeting not found")
                return JsonResponse({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            logger.info(f"Found meeting data: {meeting.to_dict()}")

            meeting_data = meeting.to_dict()
            meeting_name = meeting_data["name"]
            attendees = [attendee["email"] for attendee in meeting_data["attendees"]]
            poll_link = f"https://pookie-rookies.web.app/poll/{meeting_id}"
            poll_deadline_ISO = meeting_data.get("poll_deadline", "the specified deadline") 
            poll_deadline_datetime = (datetime.fromisoformat(poll_deadline_ISO))
            poll_deadline = poll_deadline_datetime.strftime("%d %B %Y at %I:%M %p")

            for email in attendees:
                send_email(
                    sender=sender_email,
                    to=email,
                    subject=format_email_subject(sender_name, meeting_name),
                    body=format_email_body(sender_name, meeting_name, poll_link, poll_deadline)
                )

            logger.info("All emails sent successfully")
            return JsonResponse({"message": "Emails sent successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubmitPollResponseAPIView(APIView):
    def post(self, request):
        try:
            body = request.data
            meeting_id = body.get("meeting_id")
            email = body.get("email")
            selected_date = body.get("selected_date")

            meeting_ref = db.collection("meetings").document(meeting_id)
            meeting = meeting_ref.get()

            if not meeting.exists:
                return JsonResponse({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            meeting_data = meeting.to_dict()
            attendees = meeting_data["attendees"]

            for attendee in attendees:
                if attendee["email"] == email:
                    attendee["response"] = selected_date
                    attendee["status"] = "responded"
                    break

            meeting_ref.update({"attendees": attendees})
            return JsonResponse({"message": "Poll response submitted successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from collections import Counter
from datetime import datetime
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class FinalizeMeetingAPIView(APIView):
    def post(self, request):
        try:
            body = request.data
            meeting_id = body.get("meeting_id")
            user_id = body.get("user_id")

            # Retrieve user data
            user_ref = db.collection("profiles").document(user_id)
            user_profile = user_ref.get()

            if not user_profile.exists:
                logger.error("User not found")
                return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            sender_name = user_profile.to_dict().get("name")
            sender_email = user_profile.to_dict().get("email")

            # Retrieve meeting data
            meeting_ref = db.collection("meetings").document(meeting_id)
            meeting = meeting_ref.get()

            if not meeting.exists:
                return JsonResponse({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            meeting_data = meeting.to_dict()

            # Extract valid poll responses
            responses = [
                attendee for attendee in meeting_data["attendees"]
                if isinstance(attendee, dict) and "response" in attendee and attendee["response"]
            ]

            if not responses:
                logger.error("No valid poll responses received")
                return JsonResponse({"error": "No valid poll responses received"}, status=status.HTTP_400_BAD_REQUEST)

            # Determine the most common response (date)
            most_common_date_entry = Counter(response["response"] for response in responses if "response" in response).most_common(1)

            if not most_common_date_entry or not most_common_date_entry[0]:
                logger.error("No valid most common date found")
                return JsonResponse({"error": "No valid most common date found"}, status=status.HTTP_400_BAD_REQUEST)

            most_common_date = most_common_date_entry[0][0]

            # Validate date format
            try:
                start_time = datetime.fromisoformat(most_common_date)
            except ValueError:
                logger.error(f"Invalid ISO format for date: {most_common_date}")
                return JsonResponse({"error": f"Invalid ISO format for date: {most_common_date}"}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate the end time using the duration
            duration = meeting_data.get("duration")
            end_time = calculate_end_time(start_time.isoformat(), duration)

            # Update the meeting as finalized
            meeting_ref.update({
                "finalized_date": start_time.isoformat(),
                "finalized": True
            })

            location = meeting_data.get("location", "TBD")
            agenda = meeting_data.get("agenda", "")

            # Extract the emails from the attendees
            attendees_emails = [
                attendee["email"]
                for attendee in meeting_data["attendees"]
                if isinstance(attendee, dict) and "email" in attendee and attendee["email"].strip()
            ]

            # Check for existing event_id
            event_id = meeting_data.get("event_id")

            # Create or update the Google Calendar event
            updated_event_id = create_or_update_calendar_event(
                sender_email,
                meeting_data["name"],
                start_time,
                end_time,
                location,
                agenda,
                attendees_emails,
                event_id  # Pass the event_id if it exists
            )

            # Update Firestore with the event_id
            meeting_ref.update({"event_id": updated_event_id})

            # Send emails with the ICS attachment
            for email in attendees_emails:

                # Generate the ICS file content once
                ics_content = generate_ics_file(
                    meeting_data["name"],
                    start_time,
                    end_time,
                    location,
                    agenda,
                    sender_email,
                    email,
                    event_id=updated_event_id
                )
                send_email_with_ics(
                    sender=sender_email,
                    to=email,
                    subject=f"Meeting Finalized: {meeting_data['name']}",
                    body=f"""
Hi,

The meeting '{meeting_data['name']}' has been finalized. Details:

- Date: {start_time.strftime("%d %B %Y")}
- Start Time: {start_time.strftime("%I:%M %p")} SGT
- End Time: {end_time.strftime("%I:%M %p")} SGT
- Location: {location}
- Agenda: {agenda}

Please find the attached calendar invite.

Best Regards,
{sender_name}
                    """,
                    ics_content=ics_content  # Reuse the same ICS content
                )

            return JsonResponse({"message": "Meeting finalized and notifications sent with calendar invites."}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("An error occurred while finalizing the meeting")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to send reminder of a meeting
class SendReminderMeetingAPIView(APIView):
    def post(self, request):
        try:
            body = request.data
            logger.info(f"Request body: {body}")

            meeting_id = body.get("meeting_id")
            user_id = body.get("user_id")

            if not meeting_id or not user_id:
                logger.error("Missing meetingId or userId in request")
                return JsonResponse({"error": "Missing meetingId or userId"}, status=status.HTTP_400_BAD_REQUEST)

            logger.info(f"Extracted meeting_id: {meeting_id}, user_id: {user_id}")

            user_ref = db.collection("profiles").document(user_id)
            user_profile = user_ref.get()

            if not user_profile.exists:
                logger.error(f"User not found. User ID: {user_id}")
                return JsonResponse({"error": f"User not found. User ID: {user_id}"}, status=status.HTTP_404_NOT_FOUND)

            sender_email = user_profile.to_dict().get("email")
            sender_name = user_profile.to_dict().get("name")

            meeting_ref = db.collection("meetings").document(meeting_id)
            meeting = meeting_ref.get()

            if not meeting.exists:
                logger.error(f"Meeting not found. Meeting ID: {meeting_id}")
                return JsonResponse({"error": f"Meeting not found. Meeting ID: {meeting_id}"}, status=status.HTTP_404_NOT_FOUND)

            logger.info(f"Found meeting data: {meeting.to_dict()}")

            meeting_data = meeting.to_dict()
            meeting_name = meeting_data["name"]
            start_time = datetime.fromisoformat(meeting_data["finalized_date"])
            end_time = calculate_end_time(start_time.isoformat(), meeting_data["duration"])
            location = meeting_data["location"]
            agenda = meeting_data["agenda"]
            attendees = [attendee["email"] for attendee in meeting_data["attendees"]]

            start_time_sgt = (start_time)
            end_time_sgt = (end_time)

            for email in attendees:
                logger.info(f"Sending reminder email to: {email}")
                send_email(
                    sender=sender_email,
                    to=email,
                    subject=f"Reminder: Upcoming Meeting - {meeting_name}",
                    body=f"""
Hi,

This is a reminder for the upcoming meeting: {meeting_name}

Details:
- Date: {start_time_sgt.strftime("%d %B %Y")}
- Start Time: {start_time_sgt.strftime("%I:%M %p")} SGT
- End Time: {end_time_sgt.strftime('%I:%M %p')} SGT
- Location: {location}
- Agenda: {agenda}

We look forward to your participation.

Best Regards,
{sender_name}
                    """
                )

            logger.info("All reminder emails sent successfully")
            return JsonResponse({"message": "Reminder emails sent successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"Error occurred while sending reminder emails: {str(e)}")
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        
# Function to view poll results
class ViewPollResultsAPIView(APIView):
    def get(self, request, pk):
        try:
            meeting_ref = db.collection("meetings").document(pk)
            meeting = meeting_ref.get()

            if not meeting.exists:
                return JsonResponse({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            meeting_data = meeting.to_dict()
            responses = {attendee["email"]: attendee["response"] for attendee in meeting_data["attendees"]}
            return JsonResponse({"responses": responses}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
