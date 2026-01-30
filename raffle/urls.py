from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/qa/', views.get_qa_data, name='qa_data'),
    path('api/generate/', views.generate_raffle_steps, name='generate_steps'),
]
