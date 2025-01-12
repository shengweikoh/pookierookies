from django.test import TestCase

# Create your tests here.
from rest_framework.test import APIClient

class MeetingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_meeting(self):
        payload = {
            "name": "Team Brainstorm",
            "agenda": "Discuss project ideas",
            "attendees": ["john@example.com", "jane@example.com"],
            "location": "TBC",
            "date_range": {
                "start": "2025-01-20T10:00",
                "end": "2025-01-20T11:00"
            }
        }
        response = self.client.post('/api/meetings/create/', payload, format='json')
        self.assertEqual(response.status_code, 201)
