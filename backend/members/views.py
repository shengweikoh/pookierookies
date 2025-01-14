from datetime import datetime
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import firestore
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from .models import Member


db = firestore.client()

# Function to create a member
class CreateMemberAPIView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = request.data

            # Ensure the necessary fields are provided
            required_fields = ['name', 'email', 'group', 'role']
            for field in required_fields:
                if field not in body:
                    return JsonResponse({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the email already exists
            if db.collection("members").where('email', '==', body['email']).get():
                return JsonResponse({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Prepare member data
            member_data = {
                "name": body.get("name"),
                "email": body.get("email"),
                "group": body.get("group"),
                "role": body.get("role"),
            }

            # Create a new member in Firestore and get the document reference
            doc_ref = db.collection("members").document()  # Firestore automatically generates an ID
            member_data["memberId"] = doc_ref.id  # Assign Firestore document ID to memberId

            # Set the document with the member data
            doc_ref.set(member_data)

            # Return a successful response
            return JsonResponse({
                'memberId': member_data["memberId"],
                'name': member_data["name"],
                'email': member_data["email"],
                'group': member_data["group"],
                'role': member_data["role"]
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetAllMembersAPIView(APIView):
    def get(self, request):
        try:
            # Fetch all members from the Firestore "members" collection
            members_ref = db.collection("members")
            members = members_ref.stream()

            # Parse the members into a list of dictionaries
            members_list = [
                {**member.to_dict(), "id": member.id} for member in members
            ]

            return Response({"members": members_list}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Function to get a specific member by memberId (Firestore)
class GetMemberAPIView(APIView):
    def get(self, request, memberId):
        try:
            # Retrieve the member from Firestore using the memberId
            member_ref = db.collection("members").document(memberId)
            member = member_ref.get()

            if member.exists:
                member_data = member.to_dict()
                return Response({
                    'memberId': member_data["memberId"],
                    'name': member_data["name"],
                    'email': member_data["email"],
                    'group': member_data["group"],
                    'role': member_data["role"],
                })
            else:
                return JsonResponse({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Function to get all unique groups
class GetUniqueGroupsAPIView(APIView):
    def get(self, request):
        try:
            # Get unique groups from Firestore
            members_ref = db.collection("members")
            members = members_ref.stream()

            # Get the unique groups from the members
            groups = set([member.to_dict().get("group") for member in members if member.to_dict().get("group")])

            return JsonResponse({'groups': list(groups)})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetMembersByGroupAPIView(APIView):
    def get(self, request, group_name):
        try:
            # Query Firestore for members in the specified group
            members_ref = db.collection("members").where("group", "==", group_name)
            members = members_ref.stream()

            # Parse members into a list of dictionaries
            members_list = [
                {**member.to_dict(), "id": member.id} for member in members
            ]

            if not members_list:
                return Response(
                    {"message": f"No members found in group '{group_name}'."},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response({"members": members_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class EditMemberAPIView(APIView):
    def put(self, request, pk):
        try:
            # Retrieve the member from Firestore
            member_ref = db.collection("members").document(pk)
            member = member_ref.get()

            if not member.exists:
                return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)

            # Parse the request data and update the fields
            body = request.data
            member_ref.update(body)  # Update the member in Firestore

            return JsonResponse({"message": "Member updated successfully", "member": body}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class DeleteMemberAPIView(APIView):
    def delete(self, request, pk):
        try:
            # Retrieve the member from Firestore
            member_ref = db.collection("members").document(pk)
            member = member_ref.get()

            if not member.exists:
                return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)

            # Delete the member
            member_ref.delete()

            return JsonResponse({"message": "Member deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
