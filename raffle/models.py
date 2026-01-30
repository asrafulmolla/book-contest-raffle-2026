from django.db import models

class QuestionAnswer(models.Model):
    question = models.TextField()
    answer = models.TextField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q: {self.question[:50]}..."
