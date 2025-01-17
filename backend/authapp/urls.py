from django.urls import path
from .views import verify_token, verify_google_token

urlpatterns = [
    path('verify-token/', verify_token, name='verify_token'),
    path('verify-google-token/', verify_google_token, name='verify_google_token'),
]
