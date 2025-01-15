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
                "status": body.get("status", "Incomplete"),
                "priority:": body.get("priority", "Low"),
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
def get_task_of_user(request, profile_id, task_id):
    if request.method == "GET":
        try:
            # Retrieve the task from the tasks subcollection of the specified profile
            task_ref = db.collection("profiles").document(profile_id).collection("tasks").document(task_id)
            task = task_ref.get()

            # Retrieve the profile document to access the name field
            profile_ref = db.collection("profiles").document(profile_id)
            profile = profile_ref.get()

            if not profile.exists:
                return JsonResponse({"error": "Profile not found"}, status=404)

            profile_name = profile.to_dict().get("name", "Unknown Profile")  # Default if "name" is missing

            if task.exists:
                return JsonResponse({
                    "profileName": profile_name,
                    "task": task.to_dict()
                }, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def get_all_tasks_of_user(request, profile_id):
    if request.method == "GET":
        try:
            # Retrieve all tasks from the tasks subcollection of the specified profile
            tasks_ref = db.collection("profiles").document(profile_id).collection("tasks")
            tasks = tasks_ref.stream()

            # Retrieve the profile document to access the name field
            profile_ref = db.collection("profiles").document(profile_id)
            profile = profile_ref.get()

            if not profile.exists:
                return JsonResponse({"error": "Profile not found"}, status=404)

            profile_name = profile.to_dict().get("name", "Unknown Profile")  # Default if "name" is missing
    
            # Convert the tasks to a list of dictionaries
            tasks_list = [task.to_dict() for task in tasks]

            return JsonResponse({
                "profileName": profile_name,
                "tasks": tasks_list
            }, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def edit_task(request, task_id):
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
                "priority": body.get("priority"),  # Fixed repeated "status"
            }

            # Remove any fields that are None
            update_fields = {key: value for key, value in update_fields.items() if value is not None}

            if not update_fields:
                return JsonResponse({"error": "No fields to update"}, status=400)

            # Search for the task across all profiles
            profiles_ref = db.collection("profiles")
            task_updated = False

            for profile in profiles_ref.stream():
                profile_id = profile.id
                task_ref = db.collection("profiles").document(profile_id).collection("tasks").document(task_id)
                task = task_ref.get()

                if task.exists:
                    # Update the task in Firestore
                    task_ref.update(update_fields)
                    task_updated = True
                    break

            if task_updated:
                return JsonResponse({"message": "Task updated successfully", "updatedFields": update_fields}, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def delete_task(request, task_id):
    if request.method == "DELETE":
        try:
            # Query Firestore to find the task by task_id
            profiles_ref = db.collection("profiles")
            task_deleted = False

            # Iterate through profiles to find and delete the task
            for profile in profiles_ref.stream():
                profile_id = profile.id
                task_ref = db.collection("profiles").document(profile_id).collection("tasks").document(task_id)
                task = task_ref.get()

                if task.exists:
                    # Delete the task
                    task_ref.delete()
                    task_deleted = True
                    break

            if task_deleted:
                return JsonResponse({"message": "Task deleted successfully"}, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

# todo after groups
# @csrf_exempt
# def get_all_tasks_of_group(request, group_id):
