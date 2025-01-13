import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Define the scopes required for sending emails
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    """Authenticate and return the Gmail service instance."""
    creds = None
    token_file = 'token.json'

    # Load credentials from token file if available
    try:
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)
    except FileNotFoundError:
        # Initiate OAuth 2.0 flow if no valid token exists
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(token_file, 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def send_email(sender, to, subject, body):
    """Send an email using Gmail API."""
    service = get_gmail_service()

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
