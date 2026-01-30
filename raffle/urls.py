from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/generate/', views.generate_raffle_steps, name='generate_steps'),
]
