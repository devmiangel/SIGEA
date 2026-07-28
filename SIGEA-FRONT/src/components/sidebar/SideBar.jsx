import { useState } from 'react'
import logo_sigea from '../../assets/img/logo_sigea.png'
import { SidebarData } from './SidebarData'
import { useNavigate } from "react-router-dom"
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'

export default function Sidebar ({ role }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  return (
    <>
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-[#005C39] text-white shadow-lg hover:bg-[#004d2f] transition-colors"
      >
        {isOpen ? <CloseIcon /> : <img src={logo_sigea} alt="SIGEA" className="w-8 h-8 rounded-md" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={close} />
      )}

      <div
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-[#005C39] text-white
          flex flex-col justify-between z-40 w-56 shrink-0
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col flex-1">
          <section className="flex items-center justify-center gap-3 py-6 px-4">
            <img src={logo_sigea} alt="Logo SIGEA" className="w-12 h-12 rounded-xl" />
            <p className="text-white font-extrabold text-3xl">SIGEA</p>
          </section>

          <ul className="flex flex-col items-center px-0 overflow-y-auto">
            {SidebarData
              .filter(item => item.roles.includes(role))
              .map((val, key) => (
                <li
                  key={key}
                  onClick={() => { navigate(val.link); close() }}
                  className="flex items-center gap-3 w-full py-2.5 px-14 my-1 text-white cursor-pointer hover:bg-[#4d8d74] transition-colors"
                >
                  <div>{val.icon}</div>
                  <div>{val.title}</div>
                </li>
              ))}
          </ul>
        </div>

        <a
          href=""
          onClick={(e) => e.preventDefault()}
          className="flex items-center justify-center gap-3 text-white no-underline mb-10 hover:underline"
        >
          <AccountCircleIcon /> Perfil <ChevronRightIcon />
        </a>
      </div>
    </>
  )
}
