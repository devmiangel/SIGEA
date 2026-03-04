from django.shortcuts import render
from django.http import HttpResponse

def hello(request):
    return HttpResponse("aqui esta la visita de caracterizacion")

def vis_agro(request):
    return HttpResponse("aqui esta la visi agropecuaria")