// Selector de fecha nativo del navegador.
// `value` y el valor entregado a `onChange` son textos 'YYYY-MM-DD' (el formato
// que recibe y devuelve la API), o null cuando el campo está vacío.
export default function OtherCalendar({ placeholder, value, onChange }) {
  return (
    <input
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label={placeholder}
      title={placeholder}
      className="w-full rounded-md border border-[#015d3b] bg-white px-3.5 py-3 text-sm text-gray-900 outline-none focus:ring-[3px] focus:ring-[#015d3b]/25"
    />
  );
}
