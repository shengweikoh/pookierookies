from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
from firebase_admin import firestore
from backend.settings import db

@csrf_exempt
def create_task(request):
    if request.method == "POST":
        try:
            # Parse the request body
            body = json.loads(request.body.decode('utf-8'))

            # Ensure profile ID is provided
            profile_id = body.get("profileId")
            if not profile_id:
                return JsonResponse({"error": "Profile ID is required"}, status=400)

            # Generate a unique ID for the task
            task_id = str(uuid.uuid4())
            task_data = {
                "taskId": task_id,
                "name": body.get("name"),
                "description": body.get("description"),
                "status": body.get("status", False),
                "group": body.get("group"),
                "creationDate": datetime.now().isoformat(),
                "dueDate": body.get("dueDate"),
                "userId": profile_id,
            }

            # Add task to the tasks subcollection of the specified profile
            db.collection("profiles").document(profile_id).collection("tasks").document(task_id).set(task_data)

            return JsonResponse({"message": "Task created successfully", "task": task_data}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def get_task(request, profile_id, task_id):
    if request.method == "GET":
        try:
            # Retrieve the task from the tasks subcollection of the specified profile
            task_ref = db.collection("profiles").document(profile_id).collection("tasks").document(task_id)
            task = task_ref.get()

            if task.exists:
                return JsonResponse({"task": task.to_dict()}, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def get_all_tasks(request, profile_id):
    if request.method == "GET":
        try:
            # Retrieve all tasks from the tasks subcollection of the specified profile
            tasks_ref = db.collection("profiles").document(profile_id).collection("tasks")
            tasks = tasks_ref.stream()

            # Convert the tasks to a list of dictionaries
            tasks_list = [task.to_dict() for task in tasks]

            return JsonResponse({"tasks": tasks_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def edit_task(request, profile_id, task_id):
    if request.method == "PUT":
        try:
            # Parse the request body
            body = json.loads(request.body.decode('utf-8'))

            # Fields that can be updated
            update_fields = {
                "name": body.get("name"),
                "description": body.get("description"),
                "group": body.get("group"),
                "dueDate": body.get("dueDate"),
                "status": body.get("status"),
            }

            # Remove any fields that are None
            update_fields = {key: value for key, value in update_fields.items() if value is not None}

            if not update_fields:
                return JsonResponse({"error": "No fields to update"}, status=400)

            # Retrieve the task from the tasks subcollection of the specified profile
            task_ref = db.collection("profiles").document(profile_id).collection("tasks").document(task_id)
            task = task_ref.get()

            if task.exists:
                # Update the task in Firestore
                task_ref.update(update_fields)
                return JsonResponse({"message": "Task updated successfully", "updatedFields": update_fields}, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def delete_task(request, profile_id, task_id):
    if request.method == "DELETE":
        try:
            # Retrieve the task from the tasks subcollection of the specified profile
            task_ref = db.collection("profiles").document(profile_id).collection("tasks").document(task_id)
            task = task_ref.get()

            if task.exists:
                # Delete the task from Firestore
                task_ref.delete()
                return JsonResponse({"message": "Task deleted successfully"}, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)