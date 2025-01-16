from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from authapp.gmail_utils import get_google_calendar
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def list_events(request):
    if request.method == "POST":
        try:
            # Parse the request body
            body = json.loads(request.body.decode('utf-8'))

            # Validate 'email' field
            email = body.get("email")
            if not email:
                return JsonResponse({"error": "Email is required in the request body."}, status=400)

            # Get the optional 'month_year' field
            month_year = body.get("monthYear", None)

            # Fetch events using the provided email and optional month_year
            events = get_google_calendar(email, month_year)

            # Transform the events into the required format
            transformed_events = [
                {
                    "id": str(index + 1),
                    "title": event["summary"],
                    "start": event["start"],
                    "end": event["end"],
                    "description": f"{event['description']} | Location: {event['location']}"
                }
                for index, event in enumerate(events)
            ]

            return JsonResponse({"events": transformed_events}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON in the request body."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid method"}, status=405)