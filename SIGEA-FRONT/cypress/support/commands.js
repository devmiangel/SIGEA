import usuarios from '../fixtures/usuarios.json'

const apiUrl = () => Cypress.expose('apiUrl')

Cypress.Commands.add('apiLogin', (rol) => {
  const credenciales = usuarios[rol]

  if (!credenciales) {
    throw new Error(`Rol desconocido: ${rol}`)
  }

  return cy
    .request({
      method: 'POST',
      url: `${apiUrl()}/usuarios/login/`,
      body: {
        email: credenciales.email,
        password: credenciales.password,
      },
    })
    .then((response) => {
      expect(response.status, `login de ${rol}`).to.eq(200)
      expect(response.body.token, 'token de Knox').to.be.a('string').and.not.be.empty
      expect(response.body.user.rol, `rol devuelto por el backend`).to.eq(credenciales.rol)

      return response.body
    })
})

Cypress.Commands.add('loginByApi', (rol) => {
  const credenciales = usuarios[rol]

  cy.apiLogin(rol).then(({ token, user }) => {
    cy.visit(credenciales.ruta, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token)
        win.localStorage.setItem('user', JSON.stringify(user))
      },
    })
  })
})

Cypress.Commands.add('loginByUi', (rol) => {
  const credenciales = usuarios[rol]

  cy.visit('/')
  cy.get('[data-cy="login-email"]').clear().type(credenciales.email)
  cy.get('[data-cy="login-password"]').clear().type(credenciales.password, { log: false })
  cy.contains('button', 'Iniciar sesion').click()
})
