from django.urls import path
from .views import (
    CreateMeetingAPIView,
    MeetingListAPIView,
    MeetingDetailAPIView,
    EditMeetingAPIView,
    DeleteMeetingAPIView,
    SendEmailsAPIView,
    SubmitPollResponseAPIView,
    FinalizeMeetingAPIView,
    ViewPollResultsAPIView,
)

urlpatterns = [
    path('create/', CreateMeetingAPIView.as_view(), name='create_meeting'),
    path('list/', MeetingListAPIView.as_view(), name='list_meetings'),
    path('<str:pk>/', MeetingDetailAPIView.as_view(), name='get_meeting'),
    path('<str:pk>/edit/', EditMeetingAPIView.as_view(), name='edit_meeting'),
    path('<str:pk>/delete/', DeleteMeetingAPIView.as_view(), name='delete_meeting'),
    path('send-emails/', SendEmailsAPIView.as_view(), name='send_emails'),
    path('submit-response/', SubmitPollResponseAPIView.as_view(), name='submit_response'),
    path('finalize/', FinalizeMeetingAPIView.as_view(), name='finalize_meeting'),
    path('<str:pk>/results/', ViewPollResultsAPIView.as_view(), name='view_poll_results'),
]
