// Campo "Funcionario" con búsqueda por nombre o correo para los modales de SweetAlert2
// (asignación de visitas, insumos, herramientas y vehículos).
//
// Uso:
//   html: `... ${htmlCampoFuncionario({ label: 'Funcionario' })} ...`
//   didOpen: () => { limpiar = activarCampoFuncionario(opcionesFuncionarios(funcionarios)) }
//   didClose: () => limpiar?.()
//   preConfirm: () => { const id = leerFuncionarioId(); ... }
import { AUTOCOMPLETE_MAX_RESULTS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

const inputStyle = 'width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; font-family:inherit; background:#fff; color:#374151;'
const labelStyle = 'display:block; margin-bottom:6px; font-weight:600; font-size:13px;'

// Funcionarios de la API (`persona_info`, `email`) -> opciones { id, nombre, email }.
export function opcionesFuncionarios(funcionarios) {
    return (funcionarios || []).map((f) => ({
        id: f.id,
        nombre: [f.persona_info?.primer_nombre, f.persona_info?.primer_apellido]
            .filter(Boolean).join(' ').trim() || f.email || `Funcionario ${f.id}`,
        email: f.email ?? '',
    }))
}

export function htmlCampoFuncionario({ label = 'Funcionario', margenSuperior = false } = {}) {
    return `
        <div style="position:relative;">
            <label style="${labelStyle}${margenSuperior ? ' margin:16px 0 6px;' : ''}">${escapeHtml(label)}</label>
            <input type="text" id="swal-funcionario-input" placeholder="Busca el nombre del funcionario..." autocomplete="off" style="${inputStyle}">
            <input type="hidden" id="swal-funcionario-id" value="">
            <div id="swal-funcionario-lista" style="display:none; position:fixed; z-index:2000; background:#fff; border:1px solid #e2e8f0; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.12); max-height:200px; overflow-y:auto; text-align:left;"></div>
        </div>
    `
}

// Conecta el buscador. `inicial` = { id, nombre } para precargar una selección.
// Devuelve una función que quita los listeners globales; llamarla en `didClose`.
export function activarCampoFuncionario(opciones, inicial = null) {
    const input = document.getElementById('swal-funcionario-input')
    const lista = document.getElementById('swal-funcionario-lista')
    const hidden = document.getElementById('swal-funcionario-id')
    if (!input || !lista || !hidden) return () => {}

    // SweetAlert2 da z-index 1 al contenido y a la fila de botones; como los botones
    // van después, se pintaban encima de la lista. Se sube el contenido un nivel.
    const contenido = input.closest('.swal2-html-container')
    if (contenido) contenido.style.zIndex = '2'

    if (inicial?.id) {
        hidden.value = inicial.id
        input.value = inicial.nombre ?? ''
    }

    // La lista es `position: fixed` (para no quedar recortada por el contenido del
    // modal), así que se ubica con las coordenadas actuales del input en pantalla.
    const posicionar = () => {
        const rect = input.getBoundingClientRect()
        lista.style.top = `${rect.bottom + 4}px`
        lista.style.left = `${rect.left}px`
        lista.style.width = `${rect.width}px`
    }

    const mostrar = () => {
        posicionar()
        lista.style.display = 'block'
    }

    // Al deslizar el modal (o la página) o cambiar el tamaño de la ventana, la lista
    // abierta sigue pegada al input. `true` captura el scroll de cualquier contenedor.
    const seguirAlInput = (e) => {
        if (lista.style.display === 'none' || e?.target === lista) return
        // Si el input ya no se ve (salió del área del modal o de la ventana), se cierra.
        const rect = input.getBoundingClientRect()
        const area = contenido?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight }
        const visible = rect.bottom > Math.max(area.top, 0)
            && rect.top < Math.min(area.bottom, window.innerHeight)
        if (!visible) {
            lista.style.display = 'none'
            return
        }
        posicionar()
    }
    window.addEventListener('scroll', seguirAlInput, true)
    window.addEventListener('resize', seguirAlInput)

    const pintar = (texto) => {
        const q = texto.trim().toLowerCase()
        const items = q
            ? opciones.filter((f) => f.nombre.toLowerCase().includes(q) || f.email.toLowerCase().includes(q))
            : opciones

        if (!items.length) {
            lista.innerHTML = '<div style="padding:10px 12px; color:#94a3b8; font-size:13px;">Sin resultados</div>'
            mostrar()
            return
        }

        lista.innerHTML = items.slice(0, AUTOCOMPLETE_MAX_RESULTS).map((f) => `
            <div data-id="${f.id}" style="padding:9px 12px; cursor:pointer; border-bottom:1px solid #f1f5f9;">
                <div style="font-size:13px; font-weight:500; color:#1e293b;">${escapeHtml(f.nombre)}</div>
                <div style="font-size:12px; color:#94a3b8;">${escapeHtml(f.email)}</div>
            </div>
        `).join('')

        mostrar()
        lista.querySelectorAll('div[data-id]').forEach((el) => {
            el.addEventListener('mouseenter', () => { el.style.background = '#f0fdf4' })
            el.addEventListener('mouseleave', () => { el.style.background = '#ffffff' })
            el.addEventListener('click', () => {
                hidden.value = el.dataset.id
                input.value = el.querySelector('div').textContent.trim()
                lista.style.display = 'none'
            })
        })
    }

    input.addEventListener('focus', () => pintar(input.value))
    input.addEventListener('input', () => { pintar(input.value); hidden.value = '' })

    const cerrarAlClicFuera = (e) => {
        if (!e.target.closest('#swal-funcionario-input') && !e.target.closest('#swal-funcionario-lista')) {
            lista.style.display = 'none'
        }
    }
    document.addEventListener('click', cerrarAlClicFuera)
    return () => {
        document.removeEventListener('click', cerrarAlClicFuera)
        window.removeEventListener('scroll', seguirAlInput, true)
        window.removeEventListener('resize', seguirAlInput)
    }
}

// Id del funcionario elegido de la lista ('' si solo se escribió texto).
export function leerFuncionarioId() {
    return document.getElementById('swal-funcionario-id')?.value ?? ''
}
