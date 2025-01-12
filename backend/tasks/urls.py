from django.urls import path
from .views import create_task, get_task

urlpatterns = [
    path('create/', create_task, name='create_task'),
    path('<str:task_id>/', get_task, name='get_task'),
]