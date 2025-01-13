from datetime import datetime
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Meeting
from .serializers import MeetingSerializer
import json
from firebase_admin import firestore

db = firestore.client()
# Function to create a meeting
class CreateMeetingAPIView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = request.data

            # Ensure the necessary fields are provided
            required_fields = ['name', 'agenda', 'attendees', 'date_range']
            for field in required_fields:
                if field not in body:
                    return JsonResponse({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Prepare meeting data
            meeting_data = {
                "name": body.get("name"),
                "agenda": body.get("agenda"),
                "attendees": body.get("attendees"),
                "location": body.get("location", ""),
                "date_range": body.get("date_range"),
                "creation_date": datetime.now().isoformat()
            }

            # Create a new meeting in Firestore and get the document reference
            doc_ref = db.collection("meetings").document()  # Generate a new document reference
            meeting_data["meetingId"] = doc_ref.id  # Assign the generated ID to meeting_data
            
            # Set the document with the meeting data
            doc_ref.set(meeting_data)

            # Return a successful response
            return JsonResponse({"message": "Meeting created successfully", "meeting": meeting_data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Function to get a list of meetings
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


        

# # Function to get meetings by date range (for scheduling purposes)
# class MeetingByDateRangeAPIView(APIView):
#     def get(self, request):
#         try:
#             start_date = request.query_params.get('start')
#             end_date = request.query_params.get('end')

#             if not start_date or not end_date:
#                 return JsonResponse({"error": "Start and end date are required"}, status=status.HTTP_400_BAD_REQUEST)

#             # Filter meetings within the specified date range
#             meetings = Meeting.objects.filter(date_range__start__gte=start_date, date_range__end__lte=end_date)
#             serializer = MeetingSerializer(meetings, many=True)

#             return Response({"meetings": serializer.data})

#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # Function to automate scheduling based on attendee availability (example)
# class AutoScheduleMeetingAPIView(APIView):
#     def post(self, request):
#         try:
#             body = request.data
#             required_fields = ['attendees', 'duration', 'date_range']
            
#             for field in required_fields:
#                 if field not in body:
#                     return JsonResponse({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

#             # Logic to check attendee availability (simplified)
#             attendees = body['attendees']
#             # Assume a function check_availability that checks availability
#             available_timeslots = check_availability(attendees, body['date_range'])

#             if not available_timeslots:
#                 return JsonResponse({"error": "No available timeslots found"}, status=status.HTTP_404_NOT_FOUND)

#             # Schedule the meeting at the first available slot (example logic)
#             scheduled_meeting = schedule_meeting(available_timeslots[0], body['attendees'], body['agenda'])

#             return JsonResponse({"message": "Meeting scheduled successfully", "scheduled_meeting": scheduled_meeting}, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # Helper function for checking availability (dummy)
# def check_availability(attendees, date_range):
#     # Example function that should check each attendee's calendar for availability
#     return ["2025-01-20T10:00:00", "2025-01-20T14:00:00"]  # Example timeslot

# # Helper function to schedule a meeting
# def schedule_meeting(timeslot, attendees, agenda):
#     # Example function to schedule a meeting based on a given time
#     return {
#         "meetingId": str(uuid.uuid4()),
#         "attendees": attendees,
#         "agenda": agenda,
#         "scheduled_time": timeslot
#     }
