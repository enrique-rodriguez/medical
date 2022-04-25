from django.shortcuts import render
from django.middleware.csrf import get_token
from django.http.response import JsonResponse

def index(request):
    return render(request, "index.html")

def csrf(request):
    return JsonResponse({ "token": get_token(request) })