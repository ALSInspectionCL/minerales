from django.urls import path, include
from rest_framework import routers
from api import views
from .views import obtener_lotes_por_fechas

router = routers.DefaultRouter()
router.register(r'servicio', views.ServicioViewSet)
router.register(r'solicitud', views.SolicitudViewSet)
router.register(r'lote', views.LoteViewSet)
router.register(r'recepcion', views.RecepcionViewSet)
router.register(r'recepcion-transporte', views.RecepcionTransporteViewSet)
router.register(r'despacho', views.DespachoViewSet)
router.register(r'despacho-camion', views.DespachoCamionViewSet)
router.register(r'lote-recepcion', views.LoteRecepcionViewSet)
router.register(r'lote-inventario', views.LoteInventarioViewSet)
router.register(r'lote-despacho',views.LoteDespachoViewSet)
router.register(r'user',views.UserViewSet)
router.register(r'bodega',views.BodegaViewSet)
router.register(r'detalle-bodega',views.DetalleBodegaViewSet)
router.register(r'despacho-embarque',views.DespachoEmbarqueViewSet)
router.register(r'user-logs',views.UserLogsViewSet)
router.register(r'trazabilidad',views.TrazabilidadViewSet)
router.register(r'trazabilidad-mecanica',views.TrazabilidadMecanicaViewSet)


urlpatterns=[
    path('', include(router.urls)),
    path('api/lotes-por-fechas/', obtener_lotes_por_fechas, name='obtener_lotes_por_fechas'),
]
