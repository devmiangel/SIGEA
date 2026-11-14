export const NAME_PATTERN = {
    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/,
    message: 'No son permitidos caracteres especiales'
}

export const nameFieldRules = ({ required = false, minLength = 2 } = {}) => ({
    ...(required && { required: 'Campo Obligatorio' }),
    pattern: NAME_PATTERN,
    minLength: { value: minLength, message: `Ingresa el nombre completo (mín. ${minLength} caracteres)` },
    maxLength: { value: 20, message: 'El nombre es demasiado largo' }
})

export const emailRules = {
    required: 'Campo Obligatorio',
    pattern: {
        value: /^(?!\.)(?!.*\.\.)([-a-zA-Z0-9_'+.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/,
        message: 'Correo inválido'
    },
    minLength: { value: 10, message: 'Mínimo 10 caracteres' },
    maxLength: { value: 40, message: 'Máximo 40 caracteres' }
}

export const documentNumberRules = {
    required: 'Campo Obligatorio',
    pattern: { value: /^\+?[0-9-]{7,20}$/, message: 'Documento inválido' },
    minLength: { value: 7, message: 'Mínimo 7 caracteres' },
    maxLength: { value: 10, message: 'Máximo 10 caracteres' }
}

// Contraseñas NUEVAS (registro / creación de usuario). Refleja las reglas del backend
// (AUTH_PASSWORD_VALIDATORS): mínimo 8 caracteres y no solo números. El backend además
// rechaza contraseñas comunes o parecidas a los datos del usuario.
export const passwordRules = {
    required: 'Campo obligatorio, mínimo 8 caracteres',
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
    maxLength: { value: 128, message: 'Máximo 128 caracteres' },
    validate: (val) => !/^\d+$/.test(val || '') || 'La contraseña no puede ser solo números',
}

// Login: solo se exige el campo (las cuentas existentes pueden tener claves más cortas).
export const loginPasswordRules = {
    required: 'Campo obligatorio',
}

export const passwordConfirmRules = (watch) => ({
    required: 'Campo obligatorio',
    validate: (val) => watch('password') === val || 'Las contraseñas no coinciden'
})