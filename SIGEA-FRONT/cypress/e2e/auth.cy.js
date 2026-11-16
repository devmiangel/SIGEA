import usuarios from '../fixtures/usuarios.json'

describe('Autenticación y control de acceso', () => {
  it('renderiza el formulario de inicio de sesión', () => {
    cy.visit('/')
    cy.contains('h2', 'Iniciar Sesión').should('be.visible')
    cy.get('[data-cy="login-email"]').should('be.visible')
    cy.get('[data-cy="login-password"]').should('be.visible')
    cy.contains('button', 'Iniciar sesion').should('be.visible')
    cy.contains('a', 'Registrate').should('be.visible')
  })

  it('muestra error con credenciales inválidas', () => {
    cy.visit('/')
    cy.get('[data-cy="login-email"]').type('noexiste@example.com')
    cy.get('[data-cy="login-password"]').type('clave-incorrecta')
    cy.contains('button', 'Iniciar sesion').click()

    cy.get('[data-cy="login-error"]')
      .should('be.visible')
      .and('contain.text', 'Credenciales inválidas')
    cy.location('pathname').should('eq', '/')
  })

  Object.entries(usuarios).forEach(([rol, credenciales]) => {
    it(`inicia sesión como ${rol} y redirige a ${credenciales.ruta}`, () => {
      cy.loginByUi(rol)
      cy.location('pathname').should('eq', credenciales.ruta)
      cy.get('[data-cy="logout"]').should('be.visible')
      cy.get('[data-cy="user-name"]').should('not.be.empty')
    })
  })

  it('redirige al login cuando se accede a una ruta privada sin sesión', () => {
    cy.visit('/administrador')
    cy.location('pathname').should('eq', '/')
  })

  it('impide que un rol acceda a las rutas de otro rol', () => {
    cy.loginByApi('funcionario')
    cy.location('pathname').should('eq', '/funcionario')

    cy.visit('/administrador')
    cy.location('pathname').should('eq', '/')
  })

  it('cierra sesión y limpia el token', () => {
    cy.loginByApi('administrador')
    cy.location('pathname').should('eq', '/administrador')

    cy.get('[data-cy="logout"]').click()

    cy.location('pathname').should('eq', '/')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.eq(null)
      expect(win.localStorage.getItem('user')).to.eq(null)
    })
  })
})
