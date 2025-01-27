from django.shortcuts import render
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import filters
from rest_framework import viewsets
from .serializer import BodegaSerializer, DespachoEmbarqueSerializer, DetalleBodegaSerializer, LoteDespachoSerializer, LoteInventarioSerializer, LoteRecepcionSerializer, ServicioSerializer, SolicitudSerializer, LoteSerializer, RecepcionSerializer, RecepcionTransporteSerializer, DespachoSerializer, DespachoCamionSerializer, UserSerializer
from .models import Bodega, DespachoEmbarque, DetalleBodega, LoteDespacho, LoteInventario, LoteRecepcion, Servicio, Solicitud, Lote, Recepcion, RecepcionTransporte, Despacho, DespachoCamion, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .utils import buscar_lotes_por_rango_fechas
from datetime import datetime

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

class  SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer

class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer

class RecepcionViewSet(viewsets.ModelViewSet):
    queryset = Recepcion.objects.all()
    serializer_class = RecepcionSerializer

class RecepcionTransporteViewSet(viewsets.ModelViewSet):
    queryset = RecepcionTransporte.objects.all()
    serializer_class = RecepcionTransporteSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('nLote',)
    def delete(self, request, *args, **kwargs):
        # Aquí podrías eliminar todos los registros
        RecepcionTransporte.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DespachoViewSet(viewsets.ModelViewSet):
    queryset = Despacho.objects.all()
    serializer_class = DespachoSerializer

class DespachoCamionViewSet(viewsets.ModelViewSet):
    queryset = DespachoCamion.objects.all()
    serializer_class = DespachoCamionSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=nLote','=estado')

class LoteRecepcionViewSet(viewsets.ModelViewSet):
    queryset = LoteRecepcion.objects.all()
    serializer_class = LoteRecepcionSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=tipoTransporte','=nLote','=fLote')


class LoteInventarioViewSet(viewsets.ModelViewSet):
    queryset = LoteInventario.objects.all()
    serializer_class = LoteInventarioSerializer

class LoteDespachoViewSet(viewsets.ModelViewSet):
    queryset = LoteDespacho.objects.all()
    serializer_class = LoteDespachoSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=tipoTransporte','=nLote')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=rol','=username','=email')

class BodegaViewSet(viewsets.ModelViewSet):
    queryset = Bodega.objects.all()
    serializer_class = BodegaSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=idBodega','=nombreBodega')

class DetalleBodegaViewSet(viewsets.ModelViewSet):
    queryset = DetalleBodega.objects.all()
    serializer_class = DetalleBodegaSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=idBodega')

class DespachoEmbarqueViewSet(viewsets.ModelViewSet):
    queryset = DespachoEmbarque.objects.all()
    serializer_class = DespachoEmbarqueSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=nLote','=estado')


def obtener_lotes_por_fechas(request):
    fecha1_str = request.GET.get('fecha1')
    fecha2_str = request.GET.get('fecha2')

    if fecha1_str and fecha2_str:
        fecha1 = datetime.strptime(fecha1_str, "%Y-%m-%d").date()
        fecha2 = datetime.strptime(fecha2_str, "%Y-%m-%d").date()

        lotes = buscar_lotes_por_rango_fechas(fecha1, fecha2)
        lotes_data = list(lotes.values())  # Convertir a lista de diccionarios
        return JsonResponse(lotes_data, safe=False)
    
    return JsonResponse({'error': 'Fechas no válidas'}, status=400)
# Create your views here.
