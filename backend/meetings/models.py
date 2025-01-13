from django.db import models

class Meeting(models.Model):
    meetingId = models.CharField(max_length=255, unique=True)  # Store Firestore document ID
    name = models.CharField(max_length=100)
    agenda = models.TextField()
    attendees = models.JSONField()  # List of attendee dictionaries
    proposed_dates = models.JSONField()  # List of proposed dates
    poll_deadline = models.DateTimeField()  # Deadline for poll responses
    finalized_date = models.DateTimeField(null=True, blank=True)  # Finalized meeting date
    finalized = models.BooleanField(default=False)  # If the meeting has been finalized
    location = models.CharField(max_length=255, blank=True, null=True)
    creation_date = models.DateTimeField(auto_now_add=True)  # Automatically set the creation date

    def __str__(self):
        return self.name
