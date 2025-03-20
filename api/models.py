from django.db import models # type: ignore
from django.db.models.signals import pre_save # type: ignore
from django.dispatch import receiver # type: ignore


class Bodega(models.Model):
    idBodega = models.AutoField(primary_key=True)
    nombreBodega = models.CharField(max_length=200)
    total = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    imagen = models.ImageField(upload_to='imagenes_bodegas/', blank=True, null=True)


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
    pesoBrutoHumedo = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    pesoTara =  models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    pesoNetoHumedo = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    porcHumedad = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    pesoNetoSeco = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    diferenciaPeso = models.DecimalField(max_digits=20, decimal_places=2, blank=True)
    nombreNave = models.CharField(max_length=200,blank=True, null=True)#Para el despacho maritimo
    bodegaNave = models.CharField(max_length=200,blank=True, null=True)#Para el despacho maritimo
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
    pesoLote = models.DecimalField(decimal_places=2,max_digits=10) #Diferencia entre odometroInicial y odometroFinal
    porcHumedad = models.DecimalField(decimal_places=2,max_digits=10) #Porcentaje de humedad de sub Lote
    estado = models.CharField(max_length=20)


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
 
@receiver(pre_save, sender=Recepcion)
def calculate_diferencia_humeda(sender, instance, **kwargs):
    instance.diferenciaHumeda = instance.netoHumedoOrigen - instance.netoHumedoDestino
  

# Create your models here.
