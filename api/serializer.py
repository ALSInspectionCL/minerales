from rest_framework import serializers
from .models import Bodega, DespachoEmbarque, DetalleBodega, Emails, LoteDespacho, LoteInventario, LoteRecepcion, Servicio, Solicitud, Lote, Recepcion, Despacho, DespachoCamion, RecepcionTransporte, Trazabilidad, TrazabilidadMecanica, User, UserLogs

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Servicio
        fields = '__all__'

class SolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = '__all__'

class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = '__all__'

class RecepcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recepcion
        fields  = '__all__'

class DespachoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Despacho
        fields = '__all__'

class DespachoCamionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DespachoCamion
        fields = '__all__'

class RecepcionTransporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecepcionTransporte
        fields = '__all__'

class LoteRecepcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoteRecepcion
        fields = '__all__'

class LoteInventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoteInventario
        fields = '__all__'

class LoteDespachoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoteDespacho
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class BodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bodega
        fields = '__all__'

class DetalleBodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleBodega
        fields = '__all__'

class DespachoEmbarqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = DespachoEmbarque
        fields = '__all__'

class UserLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLogs
        fields = '__all__'

class TrazabilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trazabilidad
        fields = '__all__'

class TrazabilidadMecanicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrazabilidadMecanica
        fields = '__all__'

class EmailSerializer(serializers.Serializer):
    class Meta:
        model = Emails
        fields = ['email']




