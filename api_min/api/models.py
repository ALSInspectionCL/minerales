from django.db import models # type: ignore
from django.db.models.signals import pre_save # type: ignore
from django.dispatch import receiver # type: ignore

class Bodega(models.Model):
    idBodega = models.AutoField(primary_key=True)
    nombreBodega = models.CharField(max_length=200)
    total = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    imagen = models.ImageField(upload_to='imagenes_bodegas/', blank=True, null=True)

class EquipoControl(models.Model):
    marca = models.CharField(max_length=100, blank=True, null=True)
    capacidad = models.IntegerField(blank=True, null=True)
    codigo = models.CharField(max_length=100, blank=True, null=True)
    fechaCalibracion = models.DateField(blank=True, null=True)

class Servicio(models.Model):
    nServ = models.CharField(max_length=20)
    fServ =  models.DateField()
    lServ =  models.CharField(max_length=100)
    eServ = models.CharField(max_length=20)

class Solicitud(models.Model):
    nSoli = models.CharField(max_length=20)
    nServ  = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    fiSoli = models.DateField()
    ftSoli = models.DateField(null=True, blank=True)
    lSoli = models.CharField(max_length=100)
    eSoli =  models.CharField(max_length=20)

class Lote(models.Model):
    nLote = models.CharField(max_length=200, unique=True)
    fLote = models.DateField()
    observacion = models.CharField(max_length=200)
    tipoTransporte = models.CharField(max_length=200)
    cantCamiones = models.IntegerField(blank=True)
    cantVagones =  models.IntegerField(blank=True)
    cantBigbag = models.IntegerField(blank=True)
    pesoBrutoHumedo = models.IntegerField(blank=True)
    pesoTara =  models.IntegerField(blank=True)
    pesoNetoHumedo = models.IntegerField(blank=True)
    porcHumedad = models.DecimalField(max_digits=5, decimal_places=2, blank=True)
    pesoNetoSeco = models.IntegerField(blank=True)
    diferenciaPeso = models.IntegerField(blank=True)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    solicitud = models.ForeignKey(Solicitud, on_delete=models.CASCADE)

class LoteRecepcion(models.Model):
    nLote = models.CharField(max_length=200, unique=True)
    fLote = models.DateField()
    observacion = models.CharField(max_length=200,blank=True, null=True)
    tipoTransporte = models.CharField(max_length=200)
    cantCamiones = models.IntegerField(blank=True, null=True)
    cantVagones =  models.IntegerField(blank=True, null=True)
    cantBigbag = models.IntegerField(blank=True, null=True)
    pesoBrutoHumedo = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    pesoTara =  models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    pesoNetoHumedo = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    porcHumedad = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    pesoNetoSeco = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    diferenciaPeso = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    CuOrigen = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    CuDestino = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    solicitud = models.ForeignKey(Solicitud, on_delete=models.CASCADE)

class LoteInventario(models.Model):
    nLote = models.CharField(max_length=200, unique=True)
    fLote = models.DateField()
    observacion = models.CharField(max_length=200)
    pesoNetoHumedo = models.IntegerField(blank=True)
    porcHumedad = models.DecimalField(max_digits=5, decimal_places=2, blank=True)
    pesoNetoSeco = models.IntegerField(blank=True)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    solicitud = models.ForeignKey(Solicitud, on_delete=models.CASCADE)

class LoteDespacho(models.Model):
    nLote = models.CharField(max_length=200, unique=True)
    fLote = models.DateField()
    observacion = models.CharField(max_length=200,blank=True, null=True)
    tipoTransporte = models.CharField(max_length=200)
    cantCamiones = models.IntegerField(blank=True, null=True)
    cantVagones =  models.IntegerField(blank=True, null=True)
    cantSubLotes =  models.IntegerField(blank=True, null=True)
    pesoBrutoHumedo = models.DecimalField(max_digits=20, decimal_places=3, blank=True)
    pesoTara =  models.DecimalField(max_digits=20, decimal_places=3, blank=True)
    pesoNetoHumedo = models.DecimalField(max_digits=20, decimal_places=3, blank=True)
    porcHumedad = models.DecimalField(max_digits=20, decimal_places=3, blank=True)
    pesoNetoSeco = models.DecimalField(max_digits=20, decimal_places=3, blank=True)
    diferenciaPeso = models.DecimalField(max_digits=20, decimal_places=3, blank=True)
    nombreNave = models.CharField(max_length=200,blank=True, null=True)#Para el despacho maritimo
    bodegaNave = models.CharField(max_length=200,blank=True, null=True)#Para el despacho maritimo
    CuOrigen = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    CuDestino = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    CuFino = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    fechaTermino = models.DateField(blank=True, null=True)
    fechaDUS = models.DateField(blank=True, null=True)
    DUS = models.CharField(max_length=200,blank=True, null=True)
    listaVerificacion = models.CharField(max_length=200,blank=True, null=True)
    refFocus = models.CharField(max_length=200,blank=True, null=True)
    calidad = models.CharField(max_length=200,blank=True, null=True)
    cliente = models.CharField(max_length=200,blank=True, null=True)
    contratoCochilco = models.CharField(max_length=200,blank=True, null=True)
    DV = models.CharField(max_length=200,blank=True, null=True)
    contratoAnglo = models.CharField(max_length=200,blank=True, null=True)
    fechaEnvioReporte = models.DateField(blank=True,null=True)
    fechaEntregaLab = models.DateField(blank=True,null=True)
    DUSAvanceComposito = models.DateField(blank=True,null=True)
    DUSFinales = models.DateField(blank=True,null=True)
    LALFinales = models.DateField(blank=True,null=True)
    fechaEntregaLabAduana = models.DateField(blank=True,null=True)
    lugarDescarga = models.CharField(max_length=200,blank=True, null=True)
    paisDescarga = models.CharField(max_length=200,blank=True, null=True)
    resguardoTestigoAduana = models.CharField(max_length=200,blank=True, null=True)
    numResolucionSNA = models.CharField(max_length=200,blank=True, null=True)
    exportador = models.CharField(max_length=200,blank=True, null=True)
    aduana = models.CharField(max_length=200,blank=True, null=True)
    registroINN = models.CharField(max_length=200,blank=True, null=True)
    rutExportador = models.CharField(max_length=200,blank=True, null=True)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    solicitud = models.ForeignKey(Solicitud, on_delete=models.CASCADE)

class Recepcion(models.Model):
    nRecepcion = models.IntegerField()
    nServicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    nLote = models.ForeignKey(LoteRecepcion,on_delete=models.CASCADE)
    cantTransporte = models.IntegerField() #cantidad de camiones, bigbags, trenes o vagones
    fOrigen = models.DateField() #fecha de salida del transporte
    hOrigen = models.TimeField() #hora de salida del transporte
    idTransporteOrigen = models.IntegerField()  #id del transporte que llega, numero de patente, codigo de tren, etc
    idCarro = models.IntegerField()
    sellosOrigen = models.IntegerField()
    netoHumedoOrigen = models.IntegerField()
    idTransporteDestino = models.IntegerField()
    idCarroDestino = models.IntegerField()
    sellosDestino = models.IntegerField()
    brutoDestino = models.IntegerField()
    taraDestino = models.IntegerField()
    netoHumedoDestino = models.IntegerField()
    diferenciaHumeda = models.IntegerField()
    diferenciaSeca = models.IntegerField()

class RecepcionTransporte(models.Model):
    tipoTransporte = models.CharField(max_length=20)
    nLote = models.CharField(max_length=200)
    fOrigen = models.DateField(blank=True, null=True) #fecha de salida del transporte
    hOrigen = models.TimeField(blank=True, null=True) #hora de salida del transporte
    idTransporteOrigen = models.CharField(max_length=200,blank=True, null=True)  #id del transporte que llega, numero de patente, codigo de tren, etc
    idCarro = models.CharField(max_length=200,blank=True, null=True)
    sellosOrigen = models.CharField(max_length=200,blank=True, null=True)
    brutoOrigen = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    taraOrigen = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    netoHumedoOrigen = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    idTransporteDestino = models.CharField(max_length=20,blank=True, null=True)
    fDestino = models.DateField(blank=True, null=True) #fecha de salida del transporte
    hDestino = models.TimeField(blank=True, null=True) #hora de salida del transporte
    idCarroDestino = models.CharField(max_length=200,blank=True, null=True)
    sellosDestino = models.CharField(max_length=200, blank=True, null=True)
    brutoDestino = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    taraDestino = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    netoHumedoDestino = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    diferenciaHumeda = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    diferenciaSeca = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    bodegaDescarga = models.CharField(max_length=200,blank=True, null=True)
    CuFino = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    bodega = models.ForeignKey(Bodega, on_delete=models.CASCADE)
    estado = models.CharField(max_length=20)

class Despacho(models.Model):
    nDespacho = models.IntegerField(primary_key=True)
    fCreacionDespacho = models.DateField()
    porcHumedad = models.DecimalField(decimal_places=3,max_digits=6)
    cantCamiones = models.IntegerField()
    taraCamiones = models.IntegerField()
    pesoBruto = models.IntegerField()
    pesoNeto = models.IntegerField()
    pesoNetoSeco = models.IntegerField()
    estado = models.CharField(max_length=20)
    observacion = models.CharField(max_length=300)

class DespachoCamion(models.Model):

    nLote = models.CharField(max_length=200)
    fOrigen = models.DateField(blank=True, null=True) #fecha de salida del transporte
    hOrigen = models.TimeField(blank=True, null=True) #hora de salida del transporte
    guiaDespacho = models.CharField(max_length=200,blank=True, null=True)  #id del transporte que llega, numero de patente, codigo de tren, etc
    sellosOrigen = models.CharField(max_length=200,blank=True, null=True)
    netoHumedoOrigen = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    camion = models.CharField(max_length=200,blank=True, null=True)
    fDestino = models.DateField(blank=True, null=True) #fecha de salida del transporte
    hDestino = models.TimeField(blank=True, null=True) #hora de salida del transporte
    batea = models.CharField(max_length=200,blank=True, null=True)
    pvsa = models.CharField(max_length=200)
    brutoDestino = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    taraDestino = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    netoHumedoDestino = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    diferenciaHumeda = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    diferenciaSeca = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    CuFino = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    bodega = models.ForeignKey(Bodega, on_delete=models.CASCADE)
    estado = models.CharField(max_length=20)

class DespachoEmbarque(models.Model):
    nLote = models.CharField(max_length=200)
    odometroInicial = models.DecimalField(decimal_places=2,max_digits=10)
    odometroFinal = models.DecimalField(decimal_places=2,max_digits=10)
    horaInicial = models.TimeField()
    horaFinal = models.TimeField(blank=True, null=True)
    fechaInicial = models.DateField()
    fechaFinal = models.DateField(blank=True, null=True)
    CuFino = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    pesoLote = models.DecimalField(decimal_places=2,max_digits=10) #Diferencia entre odometroInicial y odometroFinal
    porcHumedad = models.DecimalField(decimal_places=2,max_digits=10) #Porcentaje de humedad de sub Lote
    estado = models.CharField(max_length=20)
    bodega = models.CharField(max_length=200,blank=True, null=True)


class User(models.Model):
    username = models.CharField(max_length=150, null=False, blank = False)
    email = models.EmailField(unique=True, null=False, blank = False)
    rol = models.CharField(max_length=50,  null=False, blank = False)

class UserLogs(models.Model):
    email = models.CharField(max_length=50,  null=False, blank = False)
    fecha = models.DateField()
    hora = models.TimeField()

class DetalleBodega(models.Model):
    idBodega = models.ForeignKey(Bodega, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50)
    fecha = models.DateField(blank=True, null=True)
    hora = models.TimeField(blank=True, null=True)
    ingreso = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    despacho = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    
class Trazabilidad(models.Model):
    nLote = models.CharField(max_length=30)
    cliente = models.CharField(max_length=50,blank=True, null=True)
    idTransporte = models.CharField(max_length=10,blank=True, null=True)
    horaControl = models.TimeField(blank=True, null=True)
    fechaControl = models.DateField(blank=True, null=True)
    horaRLab = models.TimeField(blank=True, null=True)
    fechaRLab = models.DateField(blank=True, null=True)
    horaLab = models.TimeField(blank=True, null=True)
    fechaLab = models.DateField(blank=True, null=True)
    horaIngresoHorno = models.TimeField(blank=True, null=True)
    fechaIngresoHorno = models.DateField(blank=True, null=True)
    horaSalidaHorno = models.TimeField(blank=True, null=True)
    fechaSalidaHorno = models.DateField(blank=True, null=True)
    horaTestigoteca = models.TimeField(blank=True, null=True)
    fechaTestigoteca = models.DateField(blank=True, null=True)
    horaPreparacionMuestra = models.TimeField(blank=True, null=True)
    fechaPreparacionMuestra = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=100, blank=True, null=True)
    observacion = models.CharField(max_length=200,blank=True, null=True)
    cantidadTransporte = models.IntegerField(blank=True, null=True)
    nDUS = models.CharField(max_length=50,blank=True, null=True)
    fActual = models.DateField(max_length=10,blank=True, null=True)
    fLote = models.DateField(blank=True, null=True)
    bodega = models.CharField(max_length=30, blank=True, null=True)
    nSobre = models.CharField(max_length=30, blank=True, null=True)
    motonave = models.CharField(max_length=30, blank=True, null=True)

class TrazabilidadMecanica(models.Model):
    nLote = models.CharField(max_length=30)
    nSubLote = models.CharField(max_length=30)
    idTransporte = models.CharField(max_length=10,blank=True, null=True)
    nave = models.CharField(max_length=100,blank=True, null=True)
    bodega = models.CharField(max_length=100,blank=True, null=True)
    material = models.CharField(max_length=100,blank=True, null=True)
    muestreadoPor = models.CharField(max_length=100,blank=True, null=True)
    exportador = models.CharField(max_length=100,blank=True, null=True)
    puertoDestino = models.CharField(max_length=100,blank=True, null=True)
    contrato = models.CharField(max_length=100,blank=True, null=True)
    cliente = models.CharField(max_length=100,blank=True, null=True)
    cochilco = models.CharField(max_length=100,blank=True, null=True)
    fechaEmbarque = models.DateField(blank=True, null=True)
    numeroSubLote = models.IntegerField(blank=True, null=True)
    DUS = models.CharField(max_length=100,blank=True, null=True)
    fechaDUS = models.DateField(blank=True, null=True)
    pesoNetoHumedo = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    pesoNetoSeco = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    porcHumedad = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    responsable = models.CharField(max_length=100,blank=True, null=True)
    observacion = models.CharField(max_length=200,blank=True, null=True)
    estado = models.CharField(max_length=200, blank=True, null=True)
    fechaSobre = models.DateField(blank=True, null=True)
    fechaInstruccionDespacho = models.DateField(blank=True, null=True)
    fechaConfirmacionDespacho = models.DateField(blank=True, null=True)
    fechaDespacho = models.DateField(blank=True, null=True)
    numeroGuia = models.CharField(max_length=50, blank=True, null=True)
    laboratorio = models.CharField(max_length=50, blank=True, null=True)
    fechaLlegadaLaboratorio = models.DateField(blank=True, null=True)
    pais= models.CharField(max_length=50, blank=True, null=True)
    tipoSobre = models.CharField(max_length=50, blank=True, null=True)

class Emails(models.Model):
    emailOrigen = models.CharField(max_length=200, blank=True, null=True)
    emailDestino = models.CharField(max_length=200, blank=True, null=True)

class Humedades(models.Model):
    nLote = models.CharField(max_length=50)
    nSublote = models.CharField(max_length=30, blank=True, null=True)
    observacion = models.CharField(max_length=200)
    fInicio = models.DateField(blank=True, null=True)
    fFin = models.DateField(blank=True, null=True)
    nLata1 = models.CharField(max_length=50,blank=True, null=True)
    nLata2 = models.CharField(max_length=50,blank=True, null=True)
    pLata1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pLata2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pMaterial1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pMaterial2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pTotal1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pTotal2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    horaIngresoHorno = models.TimeField(blank=True, null=True)
    horaSalidaHorno1 = models.TimeField(blank=True, null=True)
    pSalidaHorno1Lata1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pSalidaHorno1Lata2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    horaSalidaHorno2 = models.TimeField(blank=True, null=True)
    pSalidaHorno2Lata1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pSalidaHorno2Lata2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    horaSalidaHorno3 = models.TimeField(blank=True, null=True)
    pSalidaHorno3Lata1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pSalidaHorno3Lata2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    porcHumedad1 = models.DecimalField(max_digits=20, decimal_places=5, blank=True, null=True)
    porcHumedad2 = models.DecimalField(max_digits=20, decimal_places=5, blank=True, null=True)
    porcHumedadFinal = models.DecimalField(max_digits=20, decimal_places=5, blank=True, null=True)
    
class CriteriosAceptacion(models.Model):
    porcentajeHumedad = models.DecimalField(max_digits=5, decimal_places=3, blank=True, null=True)
    variacionPeso = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)

class VerificacionBalanza(models.Model):
    codigoBalanza = models.CharField(max_length=20,blank=True, null=True)
    selloCalibracion = models.CharField(max_length=20,blank=True, null=True)
    fechaCalibracion = models.DateField(blank=True, null=True)
    horaCalibracion = models.TimeField(blank=True, null=True)
    nombreTecnico = models.CharField(max_length=100,blank=True, null=True)
    mailTecnico = models.CharField(max_length=100,blank=True, null=True)
    codigoMasaPatron1 = models.CharField(max_length=50,blank=True, null=True)
    codigoMasaPatron2 = models.CharField(max_length=50,blank=True, null=True)
    pesoTeoricoMasaPatron1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    pesoTeoricoMasaPatron2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa1peso1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa1peso2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa2peso1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa2peso2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa3peso1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa3peso2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa4peso1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa4peso2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa5peso1 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    masa5peso2 = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    intervaloAceptacion = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    estado = models.CharField(max_length=50, blank=True, null=True) 
    
class Pesaje(models.Model):
    peso = models.CharField(max_length=20)
    fecha = models.DateTimeField(auto_now_add=True)
 
@receiver(pre_save, sender=Recepcion)
def calculate_diferencia_humeda(sender, instance, **kwargs):
    instance.diferenciaHumeda = instance.netoHumedoOrigen - instance.netoHumedoDestino
  

# Create your models here.
