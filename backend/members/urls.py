from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreateMemberAPIView.as_view(), name='create_member'),
    path('unique-groups/<str:profile_id>', views.GetUniqueGroupsAPIView.as_view(), name='get_unique_groups'),
    path('all-members/<str:profile_id>', views.GetAllMembersAPIView.as_view(), name='get_all_members'),
    path('members-by-group/<str:profile_id>/<str:group_name>/', views.GetMembersByGroupAPIView.as_view(), name='get_members_by_group'),
    path('get/<str:profile_id>/<str:memberId>/', views.GetMemberAPIView.as_view(), name='get_member'),
    path('edit/<str:profile_id>/<str:member_id>/', views.EditMemberAPIView.as_view(), name='edit_member'),
    path('delete/<str:profile_id>/<str:member_id>/', views.DeleteMemberAPIView.as_view(), name='delete_member'),
]
