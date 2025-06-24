import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function FindId() {
  const [userName, setUserName] = useState('')
  const [resultEmail, setResultEmail] = useState('')
  const [resultList, setResultList] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFindId = async () => {
    if (!userName.trim()) {
      setError('이름을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    setResultEmail('')
    setResultList([])

    try {
      const res = await axios.post('/user/find-id', { userName })

      if (res.data.multiple) {
        setResultList(res.data.emailList || [])
      } else if (res.data.email) {
        setResultEmail(res.data.email)
      } else {
        setError('등록된 아이디(이메일)가 없습니다.')
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('등록된 아이디(이메일)가 없습니다.')
      } else {
        console.error('FindId API 호출 오류:', err)
        setError('아이디 조회 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🔍 아이디 찾기</h1>

      <div className="w-full max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름 입력"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
          />
          {error && !resultEmail && resultList.length === 0 && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>

        <button
          onClick={handleFindId}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? '조회 중...' : '아이디 조회'}
        </button>

        {resultEmail && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm shadow-sm">
            아이디(이메일): <strong>{resultEmail}</strong>
          </div>
        )}

        {resultList.length > 0 && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm shadow-sm">
            동일한 이름으로 등록된 이메일이 {resultList.length}건 있습니다:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              {resultList.map((email, idx) => (
                <li key={idx}><strong>{email}</strong></li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="block w-full text-sm text-gray-500 text-center hover:underline"
        >
          ← 로그인 화면으로 돌아가기
        </button>
      </div>
    </div>
  )
}
