from django.urls import path
from emailSummarizer.views import RetrieveAllEmailsAPIView, RetrieveOneEmailAPIView, SummarizeEmailAPIView

urlpatterns = [
    path('get-all-emails/', RetrieveAllEmailsAPIView.as_view(), name='retrieve_emails'),
    path('get-email/', RetrieveOneEmailAPIView.as_view(), name='retrieve_one_email'),
    path('summarize-email/', SummarizeEmailAPIView.as_view(), name='summarize_email'),
]