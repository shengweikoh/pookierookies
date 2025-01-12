import json
import logging
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from firebase_admin import auth, firestore
from django.http import JsonResponse

logger = logging.getLogger(__name__)
db = firestore.client()

@csrf_exempt
@require_http_methods(["POST"])
def verify_token(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in request body: {str(e)}")
        return JsonResponse({"error": "Invalid JSON in request body"}, status=400)

    token = data.get('token')
    
    if not token:
        logger.warning("No token provided in request")
        return JsonResponse({"error": "No token provided"}, status=400)

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")

        if not email:
            logger.error(f"No email found in token for user {uid}")
            return JsonResponse({"error": "No email found in token"}, status=400)

        # Extract name (characters before @ in email)
        name = email.split("@")[0]

        # Check if user already exists in Firestore
        user_ref = db.collection("profile").document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            # Create new profile
            user_ref.set({
                "userId": uid,
                "name": name,
                "email": email,
            })
            logger.info(f"Created new profile for user {uid}")
        else:
            logger.info(f"Profile already exists for user {uid}")
        
        return JsonResponse({"message": "User verified and profile checked!"}, status=200)
    except auth.InvalidIdTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        return JsonResponse({"error": "Invalid token"}, status=401)
    except firestore.FirebaseError as e:
        logger.error(f"Firestore error: {str(e)}")
        return JsonResponse({"error": "Database error"}, status=500)
    except Exception as e:
        logger.exception("Unexpected error in verify_token")
        return JsonResponse({"error": "An unexpected error occurred"}, status=500)

