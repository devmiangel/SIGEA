export const getRouteByRole = (role) => {
    const routes = {
        Usuarios : '/usuario',
        Administrador : '/administrador',
        Funcionario : '/funcionario', 
    }
    return routes[role] || '/'
}