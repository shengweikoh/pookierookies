# members/models.py
from django.db import models

class Member(models.Model):
    memberId = models.AutoField(primary_key=True)  # Automatically increments like a Firestore document ID
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    group = models.CharField(max_length=255)
    role = models.CharField(max_length=50)  # For role, you can use a limited set like 'head' or 'member'
    
    def __str__(self):
        return self.name

    class Meta:
        db_table = 'members'
