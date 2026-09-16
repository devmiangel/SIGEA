export default function TabList({ categories, active, onChange }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
      {categories.map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
