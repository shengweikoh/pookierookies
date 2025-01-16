from django.urls import path
from .views import create_task, get_task_of_user, get_all_tasks_assigned_by_user, edit_task, delete_task

urlpatterns = [
    path('create/', create_task, name='create_task'),
    path('<str:task_id>/delete/', delete_task, name='delete_task'),
    path('<str:uid>/<str:task_id>/edit/', edit_task, name='edit_task'),
    path('<str:profile_id>/<str:task_id>/', get_task_of_user, name='get_task_of_user'),
    path('<str:uid>/', get_all_tasks_assigned_by_user, name='get_all_tasks_assigned_by_user'),
]