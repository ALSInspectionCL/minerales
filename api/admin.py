from django.contrib import admin
from .models import Bodega, Despacho, DespachoCamion, DetalleBodega, LoteDespacho, LoteInventario, LoteRecepcion, RecepcionTransporte, Servicio, Solicitud, Lote, Recepcion, User


# Register your models here.

admin.site.register(Servicio)
admin.site.register(Solicitud)
admin.site.register(Lote)
admin.site.register(Recepcion)
admin.site.register(LoteRecepcion)
admin.site.register(LoteInventario)
admin.site.register(LoteDespacho)
admin.site.register(RecepcionTransporte)
admin.site.register(Despacho)
admin.site.register(DespachoCamion)
admin.site.register(User)
admin.site.register(Bodega)
admin.site.register(DetalleBodega)





