from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authapp.gmail_utils import list_emails, get_email_details
import logging
import json
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class RetrieveAllEmailsAPIView(APIView):
    def post(self, request):
        try:
            # Extract user_id (email) and page_token from the request body
            body = request.data
            user_id = body.get("user_id")
            if not user_id:
                return JsonResponse({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            page_token = body.get("page_token", None)


            # Retrieve emails and the next page token using list_emails
            messages, next_page_token = list_emails(user_id, page_token=page_token)

            # Fetch detailed information for each email
            emails = [get_email_details(user_id, message['id']) for message in messages]

            # Return the emails and next page token (if available)
            return JsonResponse({
                "emails": emails,
                "next_page_token": next_page_token
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error occurred while retrieving emails: {str(e)}")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RetrieveOneEmailAPIView(APIView):
    def get(self, request):
        try:
            # Extract user_id and email_id from the request body
            body = request.data
            user_id = body.get("user_id")
            email_id = body.get("email_id")
            if not user_id:
                return JsonResponse({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            if not email_id:
                return JsonResponse({"error": "email_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Use get_email_details to fetch the email details
            email_details = get_email_details(user_id, email_id)

            # Return the email details
            return JsonResponse({"email": email_details}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error occurred while retrieving the email: {str(e)}")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SummarizeEmailAPIView(APIView):
    def post(self, request):
        try:
            # Parse the JSON request body
            body = json.loads(request.body.decode('utf-8'))
            email = body.get("email")

            if not email:
                return JsonResponse({"error": "Email data is required"}, status=400)

            # Extract the necessary fields
            email_body = email.get("body", "").strip()
            email_subject = email.get("subject", "No Subject").strip()

            if not email_body:
                return JsonResponse({"error": "Email body is empty"}, status=400)

            # Call Google Gemini API for summarization
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"  # Correct URL
            headers = {
                "Content-Type": "application/json"
            }
            prompt = f"Summarize the following email in 2-3 concise sentences:\n\nSubject: {email_subject}\n\nBody: {email_body}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }

            response = requests.post(url, headers=headers, json=payload)
            # Handle response
            response_data = response.json()

            # Log the response for debugging
            logger.debug(f"Response Status Code: {response.status_code}, Response Content: {response_data}")

            if response.status_code != 200:
                error_message = response_data.get("error", {}).get("message", "Unknown error")
                logger.error(f"Google Gemini API error: {error_message}")
                return JsonResponse({"error": f"Google Gemini API error: {error_message}"}, status=response.status_code)

            # Extract the summary
            try:
                summary = (
                    response_data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                    .strip()
                )
            except (IndexError, KeyError, AttributeError) as e:
                logger.error(f"Error extracting summary: {e}")
                summary = ""

            if not summary:
                logger.error(f"Failed to extract summary. Response: {response_data}")
                return JsonResponse({"error": "Failed to generate a summary."}, status=500)

            # Return the summarized email
            return JsonResponse({
                "title": email_subject,
                "body": summary
            }, status=200)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error communicating with Google Gemini API: {str(e)}")
            return JsonResponse({"error": f"Error communicating with Google Gemini API: {str(e)}"}, status=500)

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return JsonResponse({"error": f"Unexpected error: {str(e)}"}, status=500)