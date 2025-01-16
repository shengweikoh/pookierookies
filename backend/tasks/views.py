from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from authapp.gmail_utils import send_task_email
import json
import uuid
from firebase_admin import auth
from backend.settings import db

def add_task_to_another_admin(uid, task_data):
    # Add the same task data to the tasks subcollection of assignedTo_uid
    db.collection("profiles").document(uid).collection("tasks").document(task_data["taskId"]).set(task_data)
    print(f"Task with ID {task_data['taskId']} added to assignedTo UID: {uid}")

def send_email_for_task_assignment(sender, receiver, task_data):
    email_content = {
        "subject": f"You have been assigned a task: {task_data['name']}",
        "body": f"""\
Dear {receiver},

You have been assigned a new task. Below are the details:

Task ID: {task_data['taskId']}
Task Name: {task_data['name']}
Description: {task_data['description']}
Status: {task_data['status']}
Priority: {task_data['priority']}
Group: {task_data['group']}
Assigned By: {task_data['assignedBy']}
Creation Date: {task_data['creationDate']}
Due Date: {task_data['dueDate']}

Please ensure the task is completed by the due date. If you have any questions or need further assistance, feel free to reach out to the assigner at {sender}.

Best regards,
{sender}
            """
    }
    send_task_email(sender, receiver, email_content)
    print(f"Email sent by {sender} to {receiver} for task assignment.")

def send_email_for_task_edit(sender, receiver, task_data):
    email_content = {
        "subject": f"The following task has been updated: {task_data['name']}",
        "body": f"""\
Dear {receiver},

The following task has been updated. Below are the updated details:

Task ID: {task_data['taskId']}
Task Name: {task_data['name']}
Description: {task_data['description']}
Status: {task_data['status']}
Priority: {task_data['priority']}
Group: {task_data['group']}
Assigned By: {task_data['assignedBy']}
Creation Date: {task_data['creationDate']}
Due Date: {task_data['dueDate']}

Please ensure the updated task is completed by the due date. If you have any questions or need further assistance, feel free to reach out to the assigner at {sender}.

Best regards,
{sender}
            """
    }
    send_task_email(sender, receiver, email_content)
    print(f"Email sent by {sender} to {receiver} for task edit.")

@csrf_exempt
def create_task(request):
    if request.method == "POST":
        try:
            # Parse the request body
            body = json.loads(request.body.decode('utf-8'))

            # Ensure assignedBy and assignedTo emails are provided
            assignedBy_email = body.get("assignedBy")
            if not assignedBy_email:
                return JsonResponse({"error": "AssignedBy email is required"}, status=400)
            
            assignedTo_email = body.get("assignedTo")
            if not assignedTo_email:
                return JsonResponse({"error": "AssignedTo email is required"}, status=400)

            # Fetch the UID of the assignedBy_email from Firebase Authentication
            try:
                user = auth.get_user_by_email(assignedBy_email)
                assignedBy_uid = user.uid
            except auth.UserNotFoundError:
                return JsonResponse({"error": f"User with email {assignedBy_email} not found"}, status=404)

            # Generate a unique ID for the task
            task_id = str(uuid.uuid4())
            task_data = {
                "taskId": task_id,
                "name": body.get("name"),
                "description": body.get("description"),
                "status": body.get("status", "Incomplete"),
                "priority": body.get("priority", "Low"),
                "group": body.get("group"),
                "creationDate": datetime.now().isoformat(),
                "dueDate": body.get("dueDate"),
                "assignedBy": assignedBy_email,
                "assignedTo": assignedTo_email
            }

            if not assignedBy_email == assignedTo_email:
                # Check if the assignedTo email exists in Firebase Authentication
                try:
                    assignedTo_user = auth.get_user_by_email(assignedTo_email)
                    assignedTo_uid = assignedTo_user.uid
                    print("Receiver is an admin")
                    add_task_to_another_admin(assignedTo_uid, task_data)
                except auth.UserNotFoundError:
                    print("Receiver is a non-admin")

                send_email_for_task_assignment(assignedBy_email, assignedTo_email, task_data)

            # Add task to the tasks subcollection of the specified UID
            db.collection("profiles").document(assignedBy_uid).collection("tasks").document(task_id).set(task_data)

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
def get_all_tasks_assigned_by_user(request, uid):
    if request.method == "GET":
        try:
            # Retrieve all tasks from the tasks subcollection of the specified profile
            tasks_ref = db.collection("profiles").document(uid).collection("tasks")
            tasks = tasks_ref.stream()

            # Convert the tasks to a list of dictionaries
            tasks_list = [task.to_dict() for task in tasks]

            return JsonResponse({
                "tasks": tasks_list
            }, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def edit_task(request, uid, task_id):
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

            # Get the task document from Firestore
            task_ref = db.collection("profiles").document(uid).collection("tasks").document(task_id)
            task_snapshot = task_ref.get()

            if task_snapshot.exists:
                # Convert task to dictionary
                task = task_snapshot.to_dict()

                assignedBy_email = task["assignedBy"]
                assignedTo_email = task["assignedTo"]

                # Update the task in Firestore
                task_ref.update(update_fields)

                if assignedBy_email != assignedTo_email:
                    # Check if the assignedTo email exists in Firebase Authentication
                    try:
                        assignedTo_user = auth.get_user_by_email(assignedTo_email)
                        assignedTo_uid = assignedTo_user.uid
                        print("Receiver is an admin")

                        # Update the task in the assignedTo_uid profile
                        task_ref_other = db.collection("profiles").document(assignedTo_uid).collection("tasks").document(task_id)
                        task_other_snapshot = task_ref_other.get()

                        if task_other_snapshot.exists:
                            task_ref_other.update(update_fields)
                        else:
                            return JsonResponse({"error": "Task not found in assignedTo_uid"}, status=404)

                    except auth.UserNotFoundError:
                        print("Receiver is a non-admin")

                    # Send email notification for task update
                    send_email_for_task_edit(assignedBy_email, assignedTo_email, {**task, **update_fields})
                
                return JsonResponse({"message": "Task updated successfully"}, status=200)
            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def delete_task(request, uid, task_id):
    if request.method == "DELETE":
        try:
            # Reference the task in the specified UID's profile
            task_ref = db.collection("profiles").document(uid).collection("tasks").document(task_id)
            task_snapshot = task_ref.get()

            if task_snapshot.exists:
                # Convert DocumentSnapshot to dictionary
                task = task_snapshot.to_dict()

                assignedBy_email = task["assignedBy"]
                assignedTo_email = task["assignedTo"]

                if assignedBy_email != assignedTo_email:
                    # Check if the assignedTo email exists in Firebase Authentication
                    try:
                        assignedTo_user = auth.get_user_by_email(assignedTo_email)
                        assignedTo_uid = assignedTo_user.uid
                        print("Receiver is an admin")

                        # Delete the task in the assignedTo_uid profile
                        task_ref_other = db.collection("profiles").document(assignedTo_uid).collection("tasks").document(task_id)
                        task_other_snapshot = task_ref_other.get()

                        if task_other_snapshot.exists:
                            task_ref_other.delete()
                        else:
                            return JsonResponse({"error": "Task not found in assignedTo_uid"}, status=404)

                    except auth.UserNotFoundError:
                        print("Receiver is a non-admin")

                # Delete the task in the assignedBy_uid profile
                task_ref.delete()

                return JsonResponse({"message": "Task deleted successfully"}, status=200)

            else:
                return JsonResponse({"error": "Task not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)