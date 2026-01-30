from django.contrib import admin
from .models import QuestionAnswer

@admin.register(QuestionAnswer)
class QuestionAnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'answer', 'order', 'created_at')
    list_editable = ('order',)
    search_fields = ('question', 'answer')
