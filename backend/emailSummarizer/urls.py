from django.urls import path
from .views import RetrieveEmailsAPIView

urlpatterns = [
    path('get-emails/', RetrieveEmailsAPIView.as_view(), name='retrieve_emails'),
]