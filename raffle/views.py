import random
import PyPDF2
from django.shortcuts import render
from django.http import JsonResponse
from pathlib import Path
from .models import QuestionAnswer

BASE_DIR = Path(__file__).resolve().parent.parent

def index(request):
    return render(request, 'raffle/index.html')

def get_qa_data(request):
    # Try to get from database first
    qa_objects = QuestionAnswer.objects.all()
    
    # If database is empty, seed it from PDF
    if not qa_objects.exists():
        seed_from_pdf()
        qa_objects = QuestionAnswer.objects.all()
    
    qa_list = []
    for item in qa_objects:
        qa_list.append({
            'id': item.id,
            'question': item.question,
            'answer': item.answer
        })
    
    return JsonResponse({'qa': qa_list})

def seed_from_pdf():
    pdf_path = BASE_DIR / 'Answer.pdf'
    if not pdf_path.exists():
        return
        
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            
            current_q = None
            current_a = []
            
            # Simple heuristic parsing
            for line in lines:
                if line.lower().startswith('q:') or '?' in line:
                    if current_q:
                        QuestionAnswer.objects.get_or_create(
                            question=current_q,
                            defaults={'answer': ' '.join(current_a)}
                        )
                    current_q = line
                    current_a = []
                else:
                    current_a.append(line)
            
            if current_q:
                QuestionAnswer.objects.get_or_create(
                    question=current_q,
                    defaults={'answer': ' '.join(current_a)}
                )
    except Exception as e:
        print(f"Error seeding PDF: {e}")

def generate_raffle_steps(request):
    start = int(request.GET.get('start', 1))
    end = int(request.GET.get('end', 100))
    
    if start >= end:
        return JsonResponse({'error': 'Start must be less than end'}, status=400)
    
    current_pool = list(range(start, end + 1))
    steps = []
    
    steps.append({
        'pool': list(current_pool),
        'message': f"Starting with {len(current_pool)} numbers"
    })
    
    while len(current_pool) > 1:
        size = len(current_pool)
        half_size = (size + 1) // 2
        selected_pool = sorted(random.sample(current_pool, half_size))
        
        steps.append({
            'pool': list(selected_pool),
            'message': f"Narrowed down to {len(selected_pool)} numbers"
        })
        current_pool = selected_pool
        
    return JsonResponse({'steps': steps, 'winner': current_pool[0]})
