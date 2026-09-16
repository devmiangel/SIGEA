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

export const passwordRules = {
    required: 'Campo obligatorio, entre 6 y 20 caracteres',
    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
    maxLength: { value: 20, message: 'Máximo 20 caracteres' }
}

export const passwordConfirmRules = (watch) => ({
    ...passwordRules,
    validate: (val) => watch('password') === val || 'Las contraseñas no coinciden'
})