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

            # Ensure profile ID is provided
            profile_id = body.get("profileId")
            if not profile_id:
                return JsonResponse({"error": "Profile ID is required"}, status=status.HTTP_400_BAD_REQUEST)

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
            member_id = doc_ref.id 
            member_data["memberId"] = member_id  # Assign Firestore document ID to memberId

            db.collection("profiles").document(profile_id).collection("members").document(member_id).set(member_data)

            return JsonResponse({"message": "Member created successfully", "member": member_data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
class GetAllMembersAPIView(APIView):
    def get(self, request, profile_id):
        try:
            
            members_ref = db.collection("profiles").document(profile_id).collection("members")
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
    def get(self, request, memberId, profile_id):
        try:
            # Retrieve the member from Firestore using the memberId
            member_ref = db.collection("profiles").document(profile_id).collection("members").document(memberId)
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
    def get(self, request, profile_id):
        try:
            # Get unique groups from Firestore
            members_ref = db.collection("profiles").document(profile_id).collection("members")
            members = members_ref.stream()

            # Get the unique groups from the members
            groups = set([member.to_dict().get("group") for member in members if member.to_dict().get("group")])

            return JsonResponse({'groups': list(groups)})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetMembersByGroupAPIView(APIView):
    def get(self, request, group_name, profile_id):
        try:
            # Query Firestore for members in the specified group
            members_ref = db.collection("profiles").document(profile_id).collection("members").where("group", "==", group_name)
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
    def put(self, request, profile_id, member_id):
        try:
            # Parse the request body
            body = request.data

            # Retrieve the member from Firestore
            member_ref = db.collection("profiles").document(profile_id).collection("members").document(member_id)
            member = member_ref.get()

            if not member.exists:
                return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)

            # Update the member with the provided data
            member_ref.update(body)

            return JsonResponse({"message": "Member updated successfully", "updatedFields": body}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class DeleteMemberAPIView(APIView):
    def delete(self, request, profile_id, member_id):
        try:
            # Retrieve the member from Firestore
            member_ref = db.collection("profiles").document(profile_id).collection("members").document(member_id)
            member = member_ref.get()

            if not member.exists:
                return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)

            # Delete the member
            member_ref.delete()

            return JsonResponse({"message": "Member deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)