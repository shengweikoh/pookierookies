from django.urls import path
from oauth import views

urlpatterns = [
    path('oauth2callback/', views.oauth2callback, name='oauth2callback'),
]