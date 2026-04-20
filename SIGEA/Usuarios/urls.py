from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'personas', PersonasViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'empresas', EmpresasViewSet)
router.register(r'funcionarios', FuncionariosViewSet)
router.register(r'administradores', AdministradoresViewSet)
router.register(r'productores', ProductoresViewSet)
router.register(r'tiposDocumentos', TiposDocumentosViewSet)
router.register(r'tiposContactos', TiposContactosViewSet)
router.register(r'tiposNivelesEducativos', TiposNivelesEducativosViewSet)
router.register(r'sisben', SisbenViewSet)
router.register(r'contactos', ContactosViewSet)
router.register(r'login', LoginViewSet, basename='login')


urlpatterns = router.urls