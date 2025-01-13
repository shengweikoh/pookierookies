from datetime import datetime
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Meeting
from .serializers import MeetingSerializer
import json
from firebase_admin import firestore
from collections import Counter
from authapp.gmail_utils import send_email
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

db = firestore.client()
# Function to create a meeting and poll link
class CreateMeetingAPIView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = request.data

            # Ensure the necessary fields are provided
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
                "poll_deadline": body.get("poll_deadline"),
                "finalized_date": None,
                "finalized": False,
                "location": body.get("location", ""),
                "creation_date": datetime.now().isoformat()
            }

            # Create a new meeting in Firestore and get the document reference
            doc_ref = db.collection("meetings").document()  
            meeting_data["meetingId"] = doc_ref.id  
            poll_link = f"https://pookie-rookies.web.app/poll/{doc_ref.id}" 
            meeting_data["poll_link"] = poll_link

            # Set the document with the meeting data
            doc_ref.set(meeting_data)

            # Return a successful response
            return JsonResponse({"message": "Meeting created successfully", "meeting": meeting_data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Function to get all the meetings
class MeetingListAPIView(APIView):
    def get(self, request):
        try:
            # Get all meetings from the database
            meetings_ref = db.collection("meetings")
            meetings = meetings_ref.stream()

            # Convert meetings to a list of dictionaries
            meetings_list = [meeting.to_dict() for meeting in meetings]

            return Response(meetings_list)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to get a specific meeting by ID
class MeetingDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            # Retrieve the meeting from Firestore using the provided meetingId
            meeting_ref = db.collection("meetings").document(pk)
            meeting = meeting_ref.get()

            if meeting.exists:
                return Response(meeting.to_dict())
            else:
                return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to update a meeting's details
class EditMeetingAPIView(APIView):
    def put(self, request, pk):
        try:
            # Retrieve the meeting from Firestore
            meeting_ref = db.collection("meetings").document(pk)
            meeting = meeting_ref.get()

            if not meeting.exists:
                return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            # Parse the request data and update the fields
            body = request.data
            meeting_ref.update(body)  # Update the meeting in Firestore

            return JsonResponse({"message": "Meeting updated successfully", "meeting": body}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to delete a meeting
class DeleteMeetingAPIView(APIView):
    def delete(self, request, pk):
        try:
            # Retrieve the meeting from Firestore
            meeting_ref = db.collection("meetings").document(pk)
            meeting = meeting_ref.get()

            if not meeting.exists:
                return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            # Delete the meeting
            meeting_ref.delete()

            return JsonResponse({"message": "Meeting deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import logging

logger = logging.getLogger(__name__)
# Function to send emails
@method_decorator(csrf_exempt, name='dispatch')

class SendEmailsAPIView(APIView):
    def post(self, request):
        print(f"Request received: {request.method} - {request.data}")
        try:
            body = request.data
            logger.info(f"Request body: {body}")  # Log request body

            meeting_id = body.get("meetingId")  
            user_id = body.get("userId")

            # Log extracted IDs
            logger.info(f"Extracted meeting_id: {meeting_id}, user_id: {user_id}")

            # The rest of your code...
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

            # Log success
            logger.info(f"Found meeting data: {meeting.to_dict()}")

            # The rest of your email-sending logic...
            attendees = [attendee["email"] for attendee in meeting.to_dict()["attendees"]]
            poll_link = f"https://pookie-rookies.web.app/poll/{meeting_id}"

            # Send emails and log each one
            for email in attendees:
                logger.info(f"Sending email to: {email}")
                send_email(
                    sender=sender_email,
                    to=email,
                    subject=f"Meeting Poll Invitation from {sender_name}",
                    body=f"{sender_name} has invited you to vote for a meeting date. "
                         f"Please select a date here: {poll_link}"
                )

            logger.info("All emails sent successfully")
            return JsonResponse({"message": "Emails sent successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
# Function to handle poll responses
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


# Function to finalize a meeting
class FinalizeMeetingAPIView(APIView):
    def post(self, request):
        try:
            body = request.data
            meeting_id = body.get("meeting_id")

            meeting_ref = db.collection("meetings").document(meeting_id)
            meeting = meeting_ref.get()

            if not meeting.exists:
                return JsonResponse({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

            meeting_data = meeting.to_dict()
            responses = [attendee["response"] for attendee in meeting_data["attendees"] if attendee["response"]]
            if not responses:
                return JsonResponse({"error": "No poll responses received"}, status=status.HTTP_400_BAD_REQUEST)

            most_common_date = Counter(responses).most_common(1)[0][0]
            meeting_ref.update({"finalized_date": most_common_date, "finalized": True})

            return JsonResponse({"message": "Meeting finalized successfully", "finalized_date": most_common_date}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        
