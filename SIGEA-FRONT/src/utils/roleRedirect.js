export const getRouteByRole = (role) => {
    const routes = {
        Usuarios : '/usuario',
        Administradores : '/administrador',
        Funcionarios : '/funcionario',
        Productores : '/usuario',
    }
    return routes[role] || '/'
}
