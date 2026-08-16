export function FieldError({ message }) {
    if (!message) return null
    return <p className="text-[#a22] text-[7px] absolute -bottom-4 left-1">{message}</p>
}