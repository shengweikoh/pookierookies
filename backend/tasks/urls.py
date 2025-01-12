from django.urls import path
from .views import create_task, get_task, edit_task, delete_task

urlpatterns = [
    path('create/', create_task, name='create_task'),
    path('<str:profile_id>/<str:task_id>/', get_task, name='get_task'),
    path('<str:profile_id>/<str:task_id>/edit/', edit_task, name='edit_task'),
    path('<str:profile_id>/<str:task_id>/delete/', delete_task, name='delete_task'),
]