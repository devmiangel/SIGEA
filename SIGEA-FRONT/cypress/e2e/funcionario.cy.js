const paginas = [
  { ruta: '/funcionario', contenido: 'Consulta y has solicitudes de insumos' },
  { ruta: '/funcionario/agenda', contenido: 'Agenda de visitas' },
  { ruta: '/funcionario/recursos', contenido: 'Recursos del funcionario' },
  { ruta: '/funcionario/visitas/caracterizacion', contenido: 'Formulario de caracterización' },
  { ruta: '/funcionario/visitas/visita', contenido: 'Formulario de visita técnica' },
  { ruta: '/funcionario/visitas/recibo', contenido: 'Recibo de pago' },
]

describe('Módulo Funcionario', () => {
  beforeEach(() => {
    cy.loginByApi('funcionario')
  })

  it('carga el panel principal', () => {
    cy.location('pathname').should('eq', '/funcionario')
    cy.get('[data-cy="logout"]').should('be.visible')
  })

  paginas.forEach(({ ruta, contenido }) => {
    it(`renderiza ${ruta}`, () => {
      cy.visit(ruta)
      cy.location('pathname').should('eq', ruta)
      cy.contains(contenido).should('be.visible')
    })
  })

  it('navega desde la barra lateral hacia Agenda', () => {
    cy.contains('a', 'Agenda').click()
    cy.location('pathname').should('eq', '/funcionario/agenda')
    cy.contains('Agenda de visitas').should('be.visible')
  })
})
