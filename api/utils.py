from datetime import date
from .models import Lote,LoteRecepcion, LoteDespacho
from rest_framework.decorators import api_view
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

def buscar_lotes_por_rango_fechas(fecha1, fecha2):
    resultados = Lote.objects.filter(fLote__range=[fecha1, fecha2])
    return resultados

def buscar_lotes_por_rango_fechas(fecha1, fecha2):
    resultados = LoteRecepcion.objects.filter(fLote__range=[fecha1, fecha2])
    return resultados

def buscar_lotes_por_rango_fechas(fecha1, fecha2):
    resultados = LoteDespacho.objects.filter(fLote__range=[fecha1, fecha2])
    return resultados

def correo(asunto, mensaje, destinatarios, mensaje_html):
    #Definiremos un HTML 

    send_mail(asunto, mensaje, settings.EMAIL_HOST_USER, destinatarios,False,None,None,None,mensaje_html)
