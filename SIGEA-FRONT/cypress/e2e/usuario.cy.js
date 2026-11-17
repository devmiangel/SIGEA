describe('Módulo Usuario / Productor', () => {
  beforeEach(() => {
    cy.loginByApi('productor')
  })

  it('carga el panel principal', () => {
    cy.location('pathname').should('eq', '/usuario')
    cy.get('[data-cy="logout"]').should('be.visible')
    cy.contains('Extension Agropecuaria').should('be.visible')
  })

  it('renderiza el módulo de extension agropecuaria', () => {
    cy.visit('/usuario/extension_agropecuaria')
    cy.location('pathname').should('eq', '/usuario/extension_agropecuaria')
    cy.contains(/Bienvenido al modulo extension Agropecuaria!|Mis Unidades Productivas/).should('be.visible')
  })

  it('renderiza el módulo de protección animal', () => {
    cy.visit('/usuario/proteccion_animal')
    cy.location('pathname').should('eq', '/usuario/proteccion_animal')
    cy.contains('Bienvenido').should('be.visible')
  })

  it('navega desde la tarjeta hacia extension agropecuaria', () => {
    cy.contains('a', 'ver mas').click()
    cy.location('pathname').should('eq', '/usuario/Extension_Agropecuaria')
  })
})
