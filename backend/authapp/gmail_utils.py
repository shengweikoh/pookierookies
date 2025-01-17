import base64
import pytz
import webbrowser
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow, Flow
from django.http import HttpResponseRedirect, JsonResponse
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
from firebase_admin import credentials as admin_credentials, firestore
from datetime import datetime, timedelta
import warnings
from django.conf import settings
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from zoneinfo import ZoneInfo
import os
import time

# Suppress specific warning about file_cache
warnings.filterwarnings("ignore", message="file_cache is only supported with oauth2client<4.0.0")

# Define the required Google API scopes
SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',  # Read-only access to Calendar
    'https://www.googleapis.com/auth/gmail.readonly',     # Read-only access to Gmail
    'https://www.googleapis.com/auth/gmail.send',          # Permission to send emails
    "https://www.googleapis.com/auth/calendar.events"      # Permission to create calendar events
]

# Initialize Firestore client
db = firestore.client()

def get_token_from_firestore(user_id):
    """Retrieve token data from Firestore."""
    doc = db.collection("user_tokens").document(user_id).get()
    if doc.exists:
        return doc.to_dict()
    return None

def save_token_to_firestore(user_id, access_token, refresh_token, expiry_date):
    """Save or update the user's token in Firestore."""
    db.collection('user_tokens').document(user_id).set({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expiry_date': expiry_date
    })

def get_credentials_from_token_data(token_data):
    """Create a Credentials object from stored token data in Firestore."""
    expiry_date = datetime.fromisoformat(token_data.get("expiry_date"))
    return Credentials(
        token=token_data['access_token'],
        refresh_token=token_data.get('refresh_token'),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=SCOPES
    )

def get_service(user_id, service_name, version):
    """
    Authenticate and return a Google API service instance for a specific user.
    Supports Gmail and Google Calendar APIs.
    """
    token_data = get_token_from_firestore(user_id)

    if token_data is None:
        # Redirect user to OAuth2 flow
        flow = Flow.from_client_secrets_file(
            'credentials.json',
            scopes=SCOPES
        )
        flow.redirect_uri = "https://pookierookies-backend.duckdns.org/oauth2callback"

        auth_url, _ = flow.authorization_url(prompt='consent', state=user_id)

        # Open the browser for authorization
        print(f"Redirecting to browser for authorization: {auth_url}")
        return HttpResponseRedirect(auth_url)

        # # Poll Firestore for token until user authorizes
        # print("Waiting for user to complete the authorization flow...")
        # start_time = time.time()
        # timeout = 300  # Wait for a maximum of 5 minutes
        # while True:
        #     token_data = get_token_from_firestore(user_id)
        #     if token_data:
        #         print("Authorization complete. Proceeding...")
        #         break
        #     if time.time() - start_time > timeout:
        #         raise TimeoutError("Authorization timeout. User did not complete the process.")
        #     time.sleep(5)  # Check every 5 seconds

    else: 
        creds = get_credentials_from_token_data(token_data)

    # Refresh the access token if expired
    if creds.expired:
        try:
            creds.refresh(Request())
            save_token_to_firestore(
                user_id=user_id,
                access_token=creds.token,
                refresh_token=creds.refresh_token,
                expiry_date=creds.expiry.replace(tzinfo=pytz.utc).isoformat()
            )
        except HttpError as error:
            raise RuntimeError(f"Error refreshing token: {error}")

    return build(service_name, version, credentials=creds, cache_discovery=False)

def get_gmail_service(user_id):
    """Authenticate and return the Gmail service instance for a specific user."""
    return get_service(user_id, service_name='gmail', version='v1')

def get_google_calendar_service(user_id):
    """Authenticate and return the Google Calendar service instance for a specific user."""
    return get_service(user_id, service_name='calendar', version='v3')

# Callback function to handle OAuth2 flow
def oauth2_callback(request):
    """
    Handle the OAuth2 callback from Google.
    Save the credentials to Firestore for the authenticated user.
    """
    # Extract the authorization code and user_id from the request
    code = request.GET.get('code')
    user_id = request.GET.get('state')  # User ID is passed in the 'state' parameter

    if not code or not user_id:
        return JsonResponse({"error": "Invalid callback parameters."}, status=400)
    try:
        # Initialize the OAuth2 flow
        flow = Flow.from_client_secrets_file(
            'credentials.json',
            scopes=SCOPES
        )
        flow.redirect_uri = "https://pookierookies-backend.duckdns.org/oauth2callback"

        # Exchange the authorization code for credentials
        flow.fetch_token(code=code)
        creds = flow.credentials

        # Save the credentials to Firestore
        save_token_to_firestore(
            user_id=user_id,
            access_token=creds.token,
            refresh_token=creds.refresh_token,
            expiry_date=creds.expiry.replace(tzinfo=pytz.utc).isoformat()
        )

        return JsonResponse({"message": "Credentials saved successfully."})

    except Exception as e:
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

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

def format_email_body(sender_name, meeting_name, poll_link, poll_deadline):
    return f"""
Hi,

{sender_name} has initiated a meeting poll for '{meeting_name}' and requests your participation in selecting a suitable date and time.

Meeting Details:
- Meeting Name: {meeting_name}
- Poll Deadline: {poll_deadline}

Please click the link below to access the poll and indicate your availability:
{poll_link}

Your timely response would be greatly appreciated. The poll will remain open until {poll_deadline}.

Best regards,
{sender_name}
    """

def format_email_subject(sender_name, meeting_name):
    return f"Meeting Poll Request: {meeting_name} - Action Required"

def list_emails(user_id, page_token=None, max_results=50):
    """Retrieve a paginated list of emails for a specific user."""
    # Initialize Gmail service for the user
    service = get_gmail_service(user_id)
    
    try:

        print("HELLO")
        # Fetch emails with pagination support
        results = service.users().messages().list(
            userId='me', maxResults=10, pageToken=page_token
        ).execute()
        return results.get('messages', []), results.get('nextPageToken')
    except HttpError as error:
        print(f"An error occurred while listing emails: {error}")
        raise

def extract_email_body(payload):
    """Recursively extract the email body from the payload."""
    if "parts" in payload:
        for part in payload["parts"]:
            if part.get("mimeType") == "text/plain":
                # Extract plain text content
                data = part.get("body", {}).get("data", "")
                return base64.urlsafe_b64decode(data).decode("utf-8")
            elif part.get("mimeType") == "text/html":
                # Extract HTML content if available
                data = part.get("body", {}).get("data", "")
                return base64.urlsafe_b64decode(data).decode("utf-8")
            elif "parts" in part:
                # Recursively check nested parts
                body = extract_email_body(part)
                if body != "No body content found":
                    return body

    # If no "parts", check the top-level "body"
    if payload.get("mimeType") == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data).decode("utf-8")
    elif payload.get("mimeType") == "text/html":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data).decode("utf-8")

    return "No body content found"

def extract_attachments(service, msg):
    """Extract attachments from the email."""
    attachments = []
    for part in msg.get('payload', {}).get('parts', []):
        if part.get('filename') and 'attachmentId' in part.get('body', {}):
            attachment_id = part['body']['attachmentId']
            file_name = part['filename']
            mime_type = part['mimeType']

            # Fetch attachment data
            attachment_data = service.users().messages().attachments().get(
                userId='me', messageId=msg['id'], id=attachment_id
            ).execute()

            # Decode the attachment content
            data = base64.urlsafe_b64decode(attachment_data['data'])

            attachments.append({
                'file_name': file_name,
                'mime_type': mime_type,
                'data': data.decode('utf-8', errors='ignore')  # Ensure safe decoding
            })
    return attachments

def get_email_details(user_id, email_id):
    """Retrieve full details of a specific email for a specific user."""
    service = get_gmail_service(user_id)

    try:
        # Fetch the email details
        message = service.users().messages().get(userId="me", id=email_id, format="full").execute()
        payload = message.get("payload", {})
        headers = payload.get("headers", [])

        # Extract key headers using a fallback mechanism
        subject = next((header.get("value", "No Subject") for header in headers if header.get("name") == "Subject"), "No Subject")
        sender = next((header.get("value", "Unknown Sender") for header in headers if header.get("name") == "From"), "Unknown Sender")
        to = next((header.get("value", "Unknown Recipient") for header in headers if header.get("name") == "To"), "Unknown Recipient")
        date = next((header.get("value", "Unknown Date") for header in headers if header.get("name") == "Date"), "Unknown Date")

        # Extract the body
        body = extract_email_body(payload)

        # Return email details
        return {
            "id": email_id,
            "snippet": message.get("snippet", ""),
            "subject": subject,
            "from": sender,
            "to": to,
            "date": date,
            "body": body,
            "attachments": []
        }
    except HttpError as error:
        print(f"An error occurred while fetching email details: {error}")
        raise

def send_task_email(sender, receiver, email_content):
    """Send an email using Gmail API."""
    service = get_gmail_service(sender)

    # Construct the email message
    message = {
        'raw': base64.urlsafe_b64encode(
            f"From: {sender}\nTo: {receiver}\nSubject: {email_content['subject']}\n\n{email_content['body']}".encode('utf-8')
        ).decode('utf-8')
    }
    
    try:
        # Send the email using Gmail API
        result = service.users().messages().send(userId="me", body=message).execute()
        return result
    except HttpError as error:
        print(f"An error occurred: {error}")
        raise

def get_google_calendar(user_id, month_year=None):
    """Retrieve the monthly calendar events for the given Gmail account."""
    try:
        # Initialize Google Calendar API service for the user
        service = get_google_calendar_service(user_id)

        # Determine the time range based on the month_year parameter
        if month_year:
            # Parse the month_year in the format 'YYYY-MM'
            try:
                year, month = map(int, month_year.split('-'))
                start_of_month = datetime(year, month, 1, 0, 0, 0).isoformat() + 'Z'  # Start of the specified month in UTC
                # Calculate the first day of the next month
                end_of_month = (datetime(year, month, 1) + timedelta(days=31)).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
            except ValueError:
                raise ValueError("Invalid month-year format. Use 'YYYY-MM'.")
        else:
            # Default to the current month
            now = datetime.now()
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
            end_of_month = (now.replace(day=1) + timedelta(days=31)).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'

        # Fetch events within the time range
        events_result = service.events().list(
            calendarId='primary',  # The primary calendar for the user
            timeMin=start_of_month,
            timeMax=end_of_month,
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        # Extract events from the API response
        events = events_result.get('items', [])
        if not events:
            print(f"No events found for the month: {month_year or 'current'}.")
            return []

        # Parse event details
        calendar_events = []
        for event in events:
            start = event.get('start', {}).get('dateTime', event.get('start', {}).get('date'))
            end = event.get('end', {}).get('dateTime', event.get('end', {}).get('date'))
            calendar_events.append({
                'summary': event.get('summary', 'No Title'),
                'start': start,
                'end': end,
                'description': event.get('description', 'No Description'),
                'location': event.get('location', 'No Location')
            })

        return calendar_events

    except HttpError as error:
        print(f"An error occurred while fetching the calendar: {error}")
        raise
    except ValueError as ve:
        print(f"An error occurred while parsing month-year: {ve}")
        raise

def send_email_with_ics(sender, to, subject, body, ics_content):
    """Send an email with a .ics calendar invite attached."""
    try:
        service = get_gmail_service(sender)

        # Create message container
        message = MIMEMultipart()
        message['From'] = sender
        message['To'] = to
        message['Subject'] = subject
        
        # Attach the body with the message
        message.attach(MIMEText(body, 'plain'))
        
        # Create the .ics attachment
        part = MIMEBase('text', 'calendar', method='REQUEST')
        part.set_payload(ics_content)
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', 'attachment; filename="invite.ics"')
        part.add_header('Content-Type', 'text/calendar; charset="UTF-8"; method=REQUEST')
        
        # Attach the .ics file to the email
        message.attach(part)

        # Send email
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        service.users().messages().send(userId="me", body={"raw": raw_message}).execute()

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise

def create_or_update_calendar_event(sender_email, name, start_time, end_time, location, agenda, attendees_emails, event_id=None):

    service = get_google_calendar_service(sender_email)

    event_body = {
        "summary": name,
        "location": location,
        "description": agenda,
        "start": {
            "dateTime": start_time.isoformat(),
            "timeZone": "Asia/Singapore",
        },
        "end": {
            "dateTime": end_time.isoformat(),
            "timeZone": "Asia/Singapore",
        },
        "attendees": [{"email": email} for email in attendees_emails],
    }

    if event_id:
        # Update the existing event
        event = service.events().update(calendarId="primary", eventId=event_id, body=event_body).execute()
    else:
        # Create a new event
        event = service.events().insert(calendarId="primary", body=event_body).execute()

    return event["id"]

