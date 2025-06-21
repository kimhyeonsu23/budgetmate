import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, History, Edit, Trophy } from 'lucide-react'

export default function MyPage() {
  const navigate = useNavigate()
  const email = localStorage.getItem('email') || ''
  const userName = localStorage.getItem('userName') || ''

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const navItems = [
    { icon: <User className="w-5 h-5" />, label: '내 정보 보기', path: '/mypage/info' },
    { icon: <History className="w-5 h-5" />, label: '내 소비 내역', path: '/mypage/history' },
    { icon: <Trophy className="w-5 h-5" />, label: '챌린지', path: '/mypage/challenges' },
    { icon: <Edit className="w-5 h-5" />, label: '프로필 수정', path: '/mypage/edit' },
    { icon: <LogOut className="w-5 h-5" />, label: '로그아웃', onClick: handleLogout },
  ]

  return (
    <main className="min-h-screen bg-white px-4 pt-6 pb-16 flex flex-col items-center">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">
          {userName.charAt(0) || 'U'}
        </div>
        <p className="text-lg font-semibold text-gray-800">{userName || '이름 없음'}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>

      <div className="w-full max-w-md space-y-2">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-left"
          >
            {item.icon}
            <span className="text-sm font-medium text-gray-800">{item.label}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
