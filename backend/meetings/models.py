from django.db import models

class Meeting(models.Model):
    meetingId = models.CharField(max_length=255, unique=True)  # Store Firestore document ID
    name = models.CharField(max_length=100)
    agenda = models.TextField()
    attendees = models.JSONField()  # List of emails or user IDs
    date_range = models.JSONField()  # Store the date range as a dictionary (start and end)
    creation_date = models.DateTimeField(auto_now_add=True)  # Automatically set the creation date
    location = models.CharField(max_length=255, blank=True, null=True)  # Add the location field

    def __str__(self):
        return self.name
