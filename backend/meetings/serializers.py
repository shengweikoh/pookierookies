from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['meetingId', 'name', 'agenda', 'attendees', 'date_range', 'creation_date', 'location']
