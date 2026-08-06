export function SubmitButton({ text, disabled = false, onClick, type = 'submit' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="block w-full py-2.5 px-5 bg-[#015d3b] border-none rounded-xl text-white font-bold cursor-pointer hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#015d3b]"
        >
            {text}
        </button>
    )
}