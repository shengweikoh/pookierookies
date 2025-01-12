from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
from firebase_admin import firestore

# Firestore client from settings
from backend.settings import db

@csrf_exempt
def create_task(request):
    if request.method == "POST":
        try:
            # Parse the request body
            body = json.loads(request.body.decode('utf-8'))

            # Generate a unique ID for the task
            task_id = str(uuid.uuid4())
            task_data = {
                "id": task_id,
                "name": body.get("name"),
                "description": body.get("description"),
                "status": body.get("status", False),
                "group": body.get("group"),
                "dueDate": body.get("dueDate"),
                "userID": body.get("userID"), 
            }

            # Add task to Firestore
            db.collection("tasks").document(task_id).set(task_data)

            return JsonResponse({"message": "Task created successfully", "task": task_data}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def get_task(request, task_id):
    if request.method == "GET":
        try:
            # Retrieve the task from Firestore
            task_ref = db.collection("tasks").document(task_id)
            task = task_ref.get()

            if task.exists:
                return JsonResponse({"task": task.to_dict()}, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)