from django.http import JsonResponse
from google_auth_oauthlib.flow import Flow
from oauth.utils import save_token_to_firestore

SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar.events'
]

def oauth2callback(request):
    """Handle the OAuth2 callback."""
    try:
        # Get the authorization response URL
        authorization_response = request.build_absolute_uri()

        # Load the OAuth2 flow
        flow = Flow.from_client_secrets_file(
            'credentials.json',
            scopes=SCOPES
        )
        flow.redirect_uri = "https://pookierookies-backend.duckdns.org/oauth2callback"

        # Fetch the token using the authorization response
        flow.fetch_token(authorization_response=authorization_response)
        credentials = flow.credentials

        # Save the token data in Firestore
        user_id = request.GET.get("state")  # Assuming `state` contains the user ID
        if not user_id:
            return JsonResponse({"error": "User ID missing in state"}, status=400)

        # Use `credentials.expiry` directly (already a datetime object)
        expiry_date = credentials.expiry.isoformat()  # Convert to ISO 8601 string
        save_token_to_firestore(user_id, credentials.token, credentials.refresh_token, expiry_date)

        return JsonResponse({"message": "Authorization successful. You may close this page and return to the app!"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)