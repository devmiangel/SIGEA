const paginas = [
  { ruta: '/administrador', contenido: 'Gestiona los inventarios aquí' },
  { ruta: '/administrador/inventario', contenido: 'Gestiona los insumos' },
  { ruta: '/administrador/inventario/insumos', contenido: 'Insumos del sistema' },
  { ruta: '/administrador/inventario/insumos/solicitudes', contenido: 'Solicitudes generadas' },
  { ruta: '/administrador/inventario/insumos/nuevo', contenido: 'Nuevo insumo' },
  { ruta: '/administrador/inventario/herramientas', contenido: 'Herramientas del sistema' },
  { ruta: '/administrador/inventario/herramientas/nuevo', contenido: 'Nueva herramienta' },
  { ruta: '/administrador/inventario/vehiculos', contenido: 'Vehículos del sistema' },
  { ruta: '/administrador/inventario/vehiculos/nuevo', contenido: 'Nuevo vehículo' },
  { ruta: '/administrador/horarios', contenido: 'Gestion de horarios de visitas' },
  { ruta: '/administrador/usuarios', contenido: 'Usuarios del sistema' },
  { ruta: '/administrador/usuarios/nuevo', contenido: 'Registro de usuario' },
  { ruta: '/administrador/validacion-ups', contenido: 'Validación de unidades productivas' },
  { ruta: '/administrador/visitas', contenido: 'Visitas' },
  { ruta: '/administrador/reportes', contenido: 'CONTENIDO DE REPORTES' },
]

describe('Módulo Administrador', () => {
  beforeEach(() => {
    cy.loginByApi('administrador')
  })

  it('carga el panel principal', () => {
    cy.location('pathname').should('eq', '/administrador')
    cy.get('[data-cy="logout"]').should('be.visible')
  })

  paginas.forEach(({ ruta, contenido }) => {
    it(`renderiza ${ruta}`, () => {
      cy.visit(ruta)
      cy.location('pathname').should('eq', ruta)
      cy.contains(contenido).should('be.visible')
    })
  })

  it('navega desde la barra lateral hacia Usuarios', () => {
    cy.contains('a', 'Usuarios').click()
    cy.location('pathname').should('eq', '/administrador/usuarios')
    cy.contains('Usuarios del sistema').should('be.visible')
  })
})
