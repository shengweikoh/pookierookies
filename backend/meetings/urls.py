from django.urls import path
from .views import (
    CreateMeetingAPIView,
    MeetingListAPIView,
    MeetingDetailAPIView,
    EditMeetingAPIView,
    DeleteMeetingAPIView,
    MeetingByDateRangeAPIView,
    AutoScheduleMeetingAPIView
)

urlpatterns = [
    path('create/', CreateMeetingAPIView.as_view(), name='create_meeting'),
    path('list/', MeetingListAPIView.as_view(), name='list_meetings'),
    path('<int:pk>/', MeetingDetailAPIView.as_view(), name='get_meeting'),
    path('<int:pk>/edit/', EditMeetingAPIView.as_view(), name='edit_meeting'),
    path('<int:pk>/delete/', DeleteMeetingAPIView.as_view(), name='delete_meeting'),
    path('date_range/', MeetingByDateRangeAPIView.as_view(), name='get_meetings_by_date'),
    path('auto_schedule/', AutoScheduleMeetingAPIView.as_view(), name='auto_schedule_meeting')
]
