from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import auth, firestore
import json
import logging
from authapp.utils import create_user_profile, create_admin_profile

logging.basicConfig(level=logging.INFO)  # Enable logging for debugging
# Initialize Firestore client
db = firestore.client()

@csrf_exempt
def verify_token(request):
    if request.method == "POST":
        try:
            # Check if request body exists
            if not request.body:
                logging.error("Empty request body received.")
                return JsonResponse({"message": "Request body is empty"}, status=400)

            # Parse the JSON body
            body = json.loads(request.body)
            token = body.get("token")
            
            if not token:
                logging.error("Token is missing from request.")
                return JsonResponse({"message": "Token is missing"}, status=400)

            # Verify the token using Firebase Admin SDK
            decoded_token = auth.verify_id_token(token)
            
            # Extract user details from the token
            uid = decoded_token.get("uid")
            email = decoded_token.get("email")
            name = decoded_token.get("name")
            role = "user"

            logging.info(f"Token verified successfully for user: {email} (UID: {uid})")

            # Check if the email exists in the "authorisedEmails" collection
            authorised_email_query = db.collection('authorisedEmails').where('email', '==', email).get()

            if authorised_email_query:
                # If email exists in authorisedEmails, create admin profile
                role = "admin"
                create_admin_profile(uid, email, name)
            else:
                # If email does not exist in authorisedEmails, create user profile
                create_user_profile(uid, email, name)

            return JsonResponse({
                "message": "Token verified",
                "user": {
                    "uid": uid,
                    "email": email,
                    "name": name,
                    "role": role
                }
            }, status=200)


        except json.JSONDecodeError as e:
            logging.error("Invalid JSON format.")
            return JsonResponse({"message": "Invalid JSON", "error": str(e)}, status=400)

        except auth.InvalidIdTokenError:
            logging.error("Invalid Firebase token provided.")
            return JsonResponse({"message": "Invalid token"}, status=401)

        except auth.ExpiredIdTokenError:
            logging.error("Firebase token has expired.")
            return JsonResponse({"message": "Expired token"}, status=401)

        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            return JsonResponse({"message": "An error occurred", "error": str(e)}, status=500)
    else:
        logging.error("Invalid HTTP method used.")
        return JsonResponse({"message": "Invalid method"}, status=405)
