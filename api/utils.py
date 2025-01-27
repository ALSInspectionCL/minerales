from datetime import date
from .models import Lote,LoteRecepcion, LoteDespacho

def buscar_lotes_por_rango_fechas(fecha1, fecha2):
    resultados = Lote.objects.filter(fLote__range=[fecha1, fecha2])
    return resultados

def buscar_lotes_por_rango_fechas(fecha1, fecha2):
    resultados = LoteRecepcion.objects.filter(fLote__range=[fecha1, fecha2])
    return resultados

def buscar_lotes_por_rango_fechas(fecha1, fecha2):
    resultados = LoteDespacho.objects.filter(fLote__range=[fecha1, fecha2])
    return resultados