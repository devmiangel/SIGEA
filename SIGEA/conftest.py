import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def _limpiar_cache_throttling():
    """Los contadores de throttling viven en el caché: se limpian entre tests
    para que un test no herede los intentos de otro."""
    cache.clear()
    yield
    cache.clear()
