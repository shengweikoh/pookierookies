# members/serializers.py
from rest_framework import serializers
from .models import Member

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['memberId', 'name', 'email', 'group', 'role']
