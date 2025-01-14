from django.urls import path
from .views import RetrieveAllEmailsAPIView, RetrieveOneEmailAPIView

urlpatterns = [
    path('get-all-emails/', RetrieveAllEmailsAPIView.as_view(), name='retrieve_emails'),
    path('get-email/', RetrieveOneEmailAPIView.as_view(), name='retrieve_one_email'),
]