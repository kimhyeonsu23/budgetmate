import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || '사용자'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <header className="bg-white border-b shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1
          onClick={() => navigate('/home')}
          className="text-xl font-bold text-brown-800 cursor-pointer"
        >
           가계로그
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <span className="hidden sm:inline font-medium">
            안녕하세요, <span className="text-indigo-600">{userName}</span> 님
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-500 hover:underline"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}
