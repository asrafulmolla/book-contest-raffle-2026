import random
from django.shortcuts import render
from django.http import JsonResponse

def index(request):
    return render(request, 'raffle/index.html')

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
        # Take half (round up to keep it interesting)
        size = len(current_pool)
        half_size = (size + 1) // 2
        
        # Randomly sample half
        selected_pool = sorted(random.sample(current_pool, half_size))
        
        steps.append({
            'pool': list(selected_pool),
            'message': f"Narrowed down to {len(selected_pool)} numbers"
        })
        current_pool = selected_pool
        
    return JsonResponse({'steps': steps, 'winner': current_pool[0]})
