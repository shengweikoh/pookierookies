from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import auth
import json
import logging
from authapp.utils import create_user_profile  # Import the function

logging.basicConfig(level=logging.INFO)  # Enable logging for debugging

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

            logging.info(f"Token verified successfully for user: {email} (UID: {uid})")

            # Create the user's profile in Firestore if it doesn't already exist
            try:
                create_user_profile(uid, email, name)
                logging.info(f"Profile created/updated successfully for user: {email} (UID: {uid})")
            except Exception as e:
                logging.error(f"Failed to create profile: {str(e)}")
                return JsonResponse({"message": "Failed to create profile", "error": str(e)}, status=500)

            return JsonResponse({
                "message": "Token verified",
                "user": {
                    "uid": uid,
                    "email": email,
                    "name": name
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
    
    
