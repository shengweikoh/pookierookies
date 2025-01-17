from django.urls import path
from .views import (
    CreateMeetingAPIView,
    MeetingListAPIView,
    MeetingDetailAPIView,
    EditMeetingAPIView,
    DeleteMeetingAPIView,
    SendEmailPollsAPIView,
    SubmitPollResponseAPIView,
    FinalizeMeetingAPIView,
    ViewPollResultsAPIView,
    SendReminderMeetingAPIView,
    OAuth2CallbackView 
)

urlpatterns = [
    path('create/', CreateMeetingAPIView.as_view(), name='create_meeting'),
    path('send-emails/', SendEmailPollsAPIView.as_view(), name='send_emails'),
    path('submit-response/', SubmitPollResponseAPIView.as_view(), name='submit_response'),
    path('finalize/', FinalizeMeetingAPIView.as_view(), name='finalize_meeting'),
    path('send-reminder/', SendReminderMeetingAPIView.as_view(), name='reminder_meeting'),
    path('oauth2callback/', OAuth2CallbackView.as_view(), name='oauth2_callback'),
    path('list/<str:profile_id>', MeetingListAPIView.as_view(), name='list_meetings'),
    path('<str:pk>/', MeetingDetailAPIView.as_view(), name='get_meeting'),
    path('<str:pk>/edit/', EditMeetingAPIView.as_view(), name='edit_meeting'),
    path('<str:pk>/delete/', DeleteMeetingAPIView.as_view(), name='delete_meeting'),
    path('<str:pk>/results/', ViewPollResultsAPIView.as_view(), name='view_poll_results'),
]
