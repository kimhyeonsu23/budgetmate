import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function FindPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFindPassword = async () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await axios.post('/user/send-reset-code', { email: email.trim() })

      if (res.data.success) {
        setMessage(res.data.message)
        setTimeout(() => {
          navigate(`/verify-reset-code?email=${encodeURIComponent(email.trim())}`)
        }, 1000)
      } else {
        setError(res.data.message || '인증 코드 발송에 실패했습니다.')
      }
    } catch (err) {
      console.error('send-reset-code API 오류:', err)
      setError(err.response?.data?.message || '인증 코드 발송 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📧 비밀번호 찾기</h1>
      <p className="text-sm text-center text-gray-600 mb-6">
        가입한 이메일을 입력하시면 인증 코드를 전송해드릴게요.
      </p>

      <div className="w-full max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
          />
          {error && !message && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>

        <button
          onClick={handleFindPassword}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? '요청 중...' : '인증 코드 받기'}
        </button>

        {message && (
          <p className="text-center text-sm text-green-600">{message}</p>
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
