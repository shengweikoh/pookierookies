from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import auth
import json
import logging
from authapp.utils import create_user_profile  # Import the function
from authapp.gmail_utils import get_service

from google.oauth2.credentials import Credentials



logging.basicConfig(level=logging.INFO)  # Enable logging for debugging

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os


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
    

@csrf_exempt
def verify_google_token(request):
    """
    Verify the Google token for the user. If the token is missing or expired,
    redirect to Google OAuth for re-authentication.
    """
    if request.method == "POST":
        try:
            # Parse the JSON body of the request
            request_data = json.loads(request.body)
            email = request_data.get("email")
            
            if not email:
                return JsonResponse({"error": "Email is required in the request body"}, status=400)

            # Check if the user has an existing Google token
            service = get_service(email, "gmail", "v1")

            if isinstance(service, HttpResponseRedirect):
                # Extract the Google OAuth URL from the redirect response
                auth_url = service.url
                return JsonResponse({"auth_url": auth_url}, status=200)
            
            # If service is valid, return a success response
            return JsonResponse({"message": "Google token is valid"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

    else:
        return JsonResponse({"error": "Invalid request method. Only POST is allowed."}, status=405)

def authenticate_user(sender_email):
    """Handles the authentication process and saves the token to a file."""
    SCOPES = [
    'https://www.googleapis.com/auth/calendar'
]
    # Path to the tokens directory
    TOKEN_DIR = 'tokens'

    # Ensure the directory exists
    os.makedirs(TOKEN_DIR, exist_ok=True)

    # Load the token file for the sender
    token_file_path = os.path.join(TOKEN_DIR, f'token_{sender_email}.json')


    creds = None

    # If the token file exists, load the credentials
    if os.path.exists(token_file_path):
        try:
            creds = Credentials.from_authorized_user_file(token_file_path, SCOPES)
        except Exception as e:
            print(f"Failed to load credentials from file: {e}")
            creds = None

    # If no valid credentials, or token expired, start the OAuth flow
    if not creds or not creds.valid or not creds.refresh_token:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES
        )

        # Ensure refresh token is requested
        flow.run_local_server(
            port=9090,
            access_type='offline',  # Required for refresh token
            prompt='consent'  # Forces re-prompt for user consent to get refresh token
        )

        creds = flow.credentials

        # Save the credentials to a file
        with open(token_file_path, 'w') as token:
            token.write(creds.to_json())

    return creds