from django.db import models
import uuid

class Meeting(models.Model):
    meetingId = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # Ensure the meetingId is a UUID
    name = models.CharField(max_length=100)
    agenda = models.TextField()
    attendees = models.JSONField()  # List of emails or user IDs
    date_range = models.JSONField()  # Store the date range as a dictionary (start and end)
    creation_date = models.DateTimeField(auto_now_add=True)  # Automatically set the creation date
    location = models.CharField(max_length=255, blank=True, null=True)  # Add the location field

    def __str__(self):
        return self.name
