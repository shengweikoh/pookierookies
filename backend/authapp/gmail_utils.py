import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
from firebase_admin import credentials as admin_credentials, firestore
from datetime import datetime, timezone
import warnings

# Suppress specific warning about file_cache
warnings.filterwarnings("ignore", message="file_cache is only supported with oauth2client<4.0.0")

# Define the required Gmail API scopes
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',  # Read-only access to Gmail
    'https://www.googleapis.com/auth/gmail.send'      # Permission to send emails
]

# Initialize Firestore client
db = firestore.client()

def get_token_from_firestore(user_id):
    """Fetch the user's token details from Firestore."""
    doc_ref = db.collection('user_tokens').document(user_id)
    doc = doc_ref.get()
    return doc.to_dict() if doc.exists else None

def save_token_to_firestore(user_id, access_token, refresh_token, expiry_date):
    """Save or update the user's token in Firestore."""
    db.collection('user_tokens').document(user_id).set({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expiry_date': expiry_date
    })

def get_gmail_service(user_id):
    """Authenticate and return the Gmail service instance for a specific user."""
    token_data = get_token_from_firestore(user_id)

    # Check if token data exists
    if token_data:
        creds = Credentials(
            token=token_data['access_token'],
            refresh_token=token_data['refresh_token'],
            token_uri="https://oauth2.googleapis.com/token",
            client_id="your_client_id",
            client_secret="your_client_secret"
        )

        # Refresh the access token if it has expired or the scopes are invalid
        if creds.expired:
            try:
                creds.refresh(Request())
                save_token_to_firestore(
                    user_id=user_id,
                    access_token=creds.token,
                    refresh_token=creds.refresh_token,
                    expiry_date=creds.expiry.isoformat()
                )
            except HttpError as error:
                print(f"Error during token refresh: {error}")
                raise
    else:
        # Trigger reauthentication if no valid token exists
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=9090)
        save_token_to_firestore(
            user_id=user_id,
            access_token=creds.token,
            refresh_token=creds.refresh_token,
            expiry_date=creds.expiry.isoformat()
        )

    return build('gmail', 'v1', credentials=creds, cache_discovery=False)

def send_email(sender, to, subject, body):
    """Send an email using Gmail API."""
    service = get_gmail_service(sender)

    # Construct the email message
    message = {
        'raw': base64.urlsafe_b64encode(
            f"From: {sender}\nTo: {to}\nSubject: {subject}\n\n{body}".encode('utf-8')
        ).decode('utf-8')
    }

    try:
        result = service.users().messages().send(userId="me", body=message).execute()
        return result
    except HttpError as error:
        print(f"An error occurred: {error}")
        raise

def list_emails(user_id, page_token=None, max_results=50):
    """Retrieve a paginated list of emails for a specific user."""
    # Initialize Gmail service for the user
    service = get_gmail_service(user_id)
    
    try:
        # Fetch emails with pagination support
        results = service.users().messages().list(
            userId='me', maxResults=10, pageToken=page_token
        ).execute()
        return results.get('messages', []), results.get('nextPageToken')
    except HttpError as error:
        print(f"An error occurred while listing emails: {error}")
        raise

def get_email_details(user_id, email_id):
    """Retrieve details of a specific email for a specific user."""
    # Initialize Gmail service for the user
    service = get_gmail_service(user_id)
    
    try:
        # Fetch the email details
        msg = service.users().messages().get(userId='me', id=email_id).execute()
        headers = msg.get('payload', {}).get('headers', [])
        return {
            'id': email_id,
            'snippet': msg.get('snippet', ''),
            'subject': next(
                (header['value'] for header in headers if header['name'] == 'Subject'),
                "No Subject"
            ),
            'from': next(
                (header['value'] for header in headers if header['name'] == 'From'),
                "Unknown Sender"
            )
        }
    except HttpError as error:
        print(f"An error occurred while fetching email details: {error}")
        raise