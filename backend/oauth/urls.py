from django.urls import path
from oauth import views

urlpatterns = [
    path('', views.oauth2callback, name='oauth2callback'),
]