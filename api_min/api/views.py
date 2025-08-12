import os
import tempfile
from django.shortcuts import render # type: ignore
from api_min import settings
from email.message import EmailMessage
from rest_framework.filters import SearchFilter, OrderingFilter # type: ignore
from rest_framework import filters # type: ignore
from rest_framework import viewsets # type: ignore
from .serializer import EquipoControlSerializer, VerificacionBalanzaSerializer, CriteriosAceptacionSerializer, PesajeSerializer, BodegaSerializer, DespachoEmbarqueSerializer, DetalleBodegaSerializer, EmailSerializer, HumedadesSerializer, LoteDespachoSerializer, LoteInventarioSerializer, LoteRecepcionSerializer, ServicioSerializer, SolicitudSerializer, LoteSerializer, RecepcionSerializer, RecepcionTransporteSerializer, DespachoSerializer, DespachoCamionSerializer, TrazabilidadMecanicaSerializer, TrazabilidadSerializer, UserLogSerializer, UserSerializer
from .models import CriteriosAceptacion, EquipoControl, VerificacionBalanza, Pesaje, Bodega, DespachoEmbarque, DetalleBodega, Emails, Humedades, LoteDespacho, LoteInventario, LoteRecepcion, Servicio, Solicitud, Lote, Recepcion, RecepcionTransporte, Despacho, DespachoCamion, Trazabilidad, TrazabilidadMecanica, User, UserLogs
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from django.http import JsonResponse # type: ignore
from django.http import HttpResponse # type: ignore
from .utils import buscar_lotes_por_rango_fechas
from datetime import datetime
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from django.views.decorators.csrf import csrf_exempt # type: ignore
from django.core.mail import EmailMessage # type: ignore
import traceback
from django.utils.text import get_valid_filename # type: ignore
from rest_framework.parsers import MultiPartParser # type: ignore
from django.conf import settings # type: ignore
from django.http import FileResponse # type: ignore
import convertapi # type: ignore

class PesajeViewSet(viewsets.ModelViewSet):
    queryset = Pesaje.objects.all().order_by('-fecha')
    serializer_class = PesajeSerializer

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
    search_fields = ['nLote', 'estado','=fOrigen','=fDestino']


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
    search_fields = ('=tipoTransporte','=nLote','=fLote')


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
    
class HumedadesViewSet(viewsets.ModelViewSet):
    queryset = Humedades.objects.all()
    serializer_class = HumedadesSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=nLote',)

class CriteriosAceptacionViewSet(viewsets.ModelViewSet):
    queryset = CriteriosAceptacion.objects.all()
    serializer_class = CriteriosAceptacionSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=porcentajeHumedad', '=variacionPeso')

class VerificacionBalanzaViewSet(viewsets.ModelViewSet):
    queryset = VerificacionBalanza.objects.all()
    serializer_class = VerificacionBalanzaSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=fechaCalibracion', '=mailTecnico', '=estado')

class EquipoControlViewSet(viewsets.ModelViewSet):
    queryset = EquipoControl.objects.all()
    serializer_class = EquipoControlSerializer
    filter_backends =  (SearchFilter, OrderingFilter)
    search_fields = ('=marca', '=capacidad', '=codigo', '=fechaCalibracion')


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

       
@csrf_exempt
def enviar_correo(request):
    try:
        if request.method != 'POST':
            return JsonResponse({'error': 'Método no permitido'}, status=405)

        correo_electronico = request.POST.get('correoElectronico')
        asunto = request.POST.get('asunto')
        mensaje = request.POST.get('mensaje')
        archivo = request.FILES.get('archivo')

        if not archivo:
            return JsonResponse({'error': 'No se recibió ningún archivo.'}, status=400)

        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #337dff;">Reporte Diario</h2>
            <img src="https://www.alsglobal.com/-/media/ALSGlobal/Header/logo.png?h=100&iar=0&w=99&hash=8604DD0FC648654E7A48B9EEB83D0FC1" width="80">
            <p>Estimado/a,</p>
            <p>Adjunto encontrará el <strong>reporte diario</strong> del ingreso de camiones</p>
            <p>Si tiene alguna pregunta o requiere más información, no dude en ponerse en contacto con el equipo de TI.</p>
            <p>Saludos cordiales,</p>
            <p><strong>Plataforma MIN Chile</strong></p>
            <p style="font-size: 12px; color: #777;">Este correo es generado automáticamente, por favor no responda a esta dirección.</p>
        </body>
        </html>
        """

        email = EmailMessage(
            subject=asunto or 'Reporte Diario Camiones',
            body=html_message,
            from_email='info@als-inspection.cl',
            to=[correo_electronico],
        )
        email.content_subtype = "html"
        email.attach(archivo.name, archivo.read(), archivo.content_type or 'application/octet-stream')
        email.send()

        return JsonResponse({'mensaje': 'Correo enviado con éxito'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def agregar_cors_headers(response):
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
    return response



class ConvertExcelToPDF(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        try:
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response({'error': 'No se recibió el archivo "file".'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Guardar Excel en temporal
            file_bytes = uploaded_file.read()
            with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp_excel:
                tmp_excel.write(file_bytes)
                tmp_excel_path = tmp_excel.name

            # Configurar credenciales
            convertapi.api_credentials = 'VxNYukJniSoV65WX'

            # Convertir
            result = convertapi.convert('pdf', {
                'File': tmp_excel_path,
            }, from_format='xlsx')

            # Guardar PDF
            temp_dir = tempfile.gettempdir()
            os.makedirs(temp_dir, exist_ok=True)
            saved_files = result.save_files(temp_dir)     # ← aquí
            pdf_path = saved_files[0]

            # Enviar respuesta
            response = FileResponse(open(pdf_path, 'rb'),
                                    content_type='application/pdf')

            # Limpieza
            os.remove(tmp_excel_path)
            # os.remove(pdf_path)

            return response

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Create your views here.
