from django.shortcuts import render
from drf import settings
from email.message import EmailMessage
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import filters
from rest_framework import viewsets
from .serializer import BodegaSerializer, DespachoEmbarqueSerializer, DetalleBodegaSerializer, EmailSerializer, LoteDespachoSerializer, LoteInventarioSerializer, LoteRecepcionSerializer, ServicioSerializer, SolicitudSerializer, LoteSerializer, RecepcionSerializer, RecepcionTransporteSerializer, DespachoSerializer, DespachoCamionSerializer, TrazabilidadMecanicaSerializer, TrazabilidadSerializer, UserLogSerializer, UserSerializer
from .models import Bodega, DespachoEmbarque, DetalleBodega, Emails, LoteDespacho, LoteInventario, LoteRecepcion, Servicio, Solicitud, Lote, Recepcion, RecepcionTransporte, Despacho, DespachoCamion, Trazabilidad, TrazabilidadMecanica, User, UserLogs
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.http import HttpResponse
from .utils import buscar_lotes_por_rango_fechas
from datetime import datetime
from rest_framework.decorators import api_view # type: ignore
from django_filters.rest_framework import DjangoFilterBackend # type: ignore

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
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_fields = ['fOrigen', 'fDestino']
    search_fields = ['nLote', 'estado']


class DespachoViewSet(viewsets.ModelViewSet):
    queryset = Despacho.objects.all()
    serializer_class = DespachoSerializer

class DespachoCamionViewSet(viewsets.ModelViewSet):
    queryset = DespachoCamion.objects.all()
    serializer_class = DespachoCamionSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=nLote','=estado','=fOrigen','=fDestino')

class LoteRecepcionViewSet(viewsets.ModelViewSet):
    queryset = LoteRecepcion.objects.all()
    serializer_class = LoteRecepcionSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=tipoTransporte','=nLote','=fLote','=servicio','=solicitud')


class LoteInventarioViewSet(viewsets.ModelViewSet):
    queryset = LoteInventario.objects.all()
    serializer_class = LoteInventarioSerializer

class LoteDespachoViewSet(viewsets.ModelViewSet):
    queryset = LoteDespacho.objects.all()
    serializer_class = LoteDespachoSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=tipoTransporte','=nLote','=fLote','=servicio','=solicitud')

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
    search_fields = ('=idBodega','=fecha')

class DespachoEmbarqueViewSet(viewsets.ModelViewSet):
    queryset = DespachoEmbarque.objects.all()
    serializer_class = DespachoEmbarqueSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=nLote','=estado','=fechaInicial','=fechaFinal')

class UserLogsViewSet(viewsets.ModelViewSet):
    queryset = UserLogs.objects.all()
    serializer_class = UserLogSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=email','=fecha')

class TrazabilidadViewSet(viewsets.ModelViewSet):
    queryset = Trazabilidad.objects.all()
    serializer_class = TrazabilidadSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=nLote','=estado','=idTransporte')

class TrazabilidadMecanicaViewSet(viewsets.ModelViewSet):
    queryset = TrazabilidadMecanica.objects.all()
    serializer_class = TrazabilidadMecanicaSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=nLote','=estado','=idTransporte')

class EmailsViewSet(viewsets.ModelViewSet):
    queryset = Emails.objects.all()
    serializer_class = EmailSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=email',)


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

def agregar_cors_headers(response):
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
    return response

def enviar_correo(request):
    if request.method == 'POST':
        correo_electronico = request.POST.get('correoElectronico')
        asunto = request.POST.get('asunto')
        mensaje = request.POST.get('mensaje')
        archivo = request.FILES.get('archivo')

        email = EmailMessage(
            asunto,
            mensaje,
            settings.EMAIL_HOST_USER,
            [correo_electronico],
        )
        email.attach(archivo.name, archivo.read(), archivo.content_type)

        email.send(fail_silently=False)

        return JsonResponse({'mensaje': 'Correo enviado con éxito'})
    else:
        return JsonResponse({'mensaje': 'Error al enviar el correo'})

# Create your views here.
