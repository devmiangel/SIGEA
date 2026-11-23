"""Utilidades compartidas por las pruebas."""


def filas(resp):
    """Filas de una respuesta de listado: ``results`` si viene paginada, o la lista.

    Falla (en vez de devolver ``[]``) si la respuesta no es un listado, para que una
    prueba de "no ve datos ajenos" no pase por accidente con un error o un objeto.
    """
    datos = resp.data
    if isinstance(datos, dict) and isinstance(datos.get('results'), list):
        return datos['results']
    if isinstance(datos, list):
        return datos
    raise AssertionError(f'La respuesta no es un listado: {str(datos)[:200]}')
