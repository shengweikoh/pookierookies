from datetime import datetime
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Meeting
from .serializers import MeetingSerializer
import json
import uuid

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

            # Generate a unique meeting ID
            meeting_id = str(uuid.uuid4())

            # Prepare meeting data
            meeting_data = {
                "meetingId": meeting_id,
                "name": body.get("name"),
                "agenda": body.get("agenda"),
                "attendees": body.get("attendees"),
                "location": body.get("location", ""),
                "date_range": body.get("date_range"),
                "creation_date": datetime.now().isoformat()
            }

            # Create and save the meeting
            meeting = Meeting.objects.create(**meeting_data)

            # Return a successful response
            return JsonResponse({"message": "Meeting created successfully", "meeting": meeting_data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Function to get a list of meetings
class MeetingListAPIView(APIView):
    def get(self, request):
        try:
            # Get all meetings from the database
            meetings = Meeting.objects.all()
            serializer = MeetingSerializer(meetings, many=True)
            return Response(serializer.data)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Function to get a specific meeting by ID
class MeetingDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
            serializer = MeetingSerializer(meeting)
            return Response(serializer.data)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)


# Function to update a meeting's details
class EditMeetingAPIView(APIView):
    def put(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
            serializer = MeetingSerializer(meeting, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Meeting updated successfully", "meeting": serializer.data})

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)


# Function to delete a meeting
class DeleteMeetingAPIView(APIView):
    def delete(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
            meeting.delete()
            return Response({"message": "Meeting deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)
        

# Function to get meetings by date range (for scheduling purposes)
class MeetingByDateRangeAPIView(APIView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start')
            end_date = request.query_params.get('end')

            if not start_date or not end_date:
                return JsonResponse({"error": "Start and end date are required"}, status=status.HTTP_400_BAD_REQUEST)

            # Filter meetings within the specified date range
            meetings = Meeting.objects.filter(date_range__start__gte=start_date, date_range__end__lte=end_date)
            serializer = MeetingSerializer(meetings, many=True)

            return Response({"meetings": serializer.data})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Function to automate scheduling based on attendee availability (example)
class AutoScheduleMeetingAPIView(APIView):
    def post(self, request):
        try:
            body = request.data
            required_fields = ['attendees', 'duration', 'date_range']
            
            for field in required_fields:
                if field not in body:
                    return JsonResponse({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Logic to check attendee availability (simplified)
            attendees = body['attendees']
            # Assume a function check_availability that checks availability
            available_timeslots = check_availability(attendees, body['date_range'])

            if not available_timeslots:
                return JsonResponse({"error": "No available timeslots found"}, status=status.HTTP_404_NOT_FOUND)

            # Schedule the meeting at the first available slot (example logic)
            scheduled_meeting = schedule_meeting(available_timeslots[0], body['attendees'], body['agenda'])

            return JsonResponse({"message": "Meeting scheduled successfully", "scheduled_meeting": scheduled_meeting}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Helper function for checking availability (dummy)
def check_availability(attendees, date_range):
    # Example function that should check each attendee's calendar for availability
    return ["2025-01-20T10:00:00", "2025-01-20T14:00:00"]  # Example timeslot

# Helper function to schedule a meeting
def schedule_meeting(timeslot, attendees, agenda):
    # Example function to schedule a meeting based on a given time
    return {
        "meetingId": str(uuid.uuid4()),
        "attendees": attendees,
        "agenda": agenda,
        "scheduled_time": timeslot
    }
