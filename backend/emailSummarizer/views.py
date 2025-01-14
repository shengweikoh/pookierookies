from django.shortcuts import render

# Create your views here.
from datetime import datetime
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authapp.gmail_utils import list_emails, get_email_details
import logging

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