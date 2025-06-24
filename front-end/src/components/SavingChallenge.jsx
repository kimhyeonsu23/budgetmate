import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function SavingChallenge() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [inputBudget, setInputBudget] = useState('')
  const [budget, setBudget] = useState(0)
  const [monthlySpending, setMonthlySpending] = useState(0)

  const token = localStorage.getItem('accessToken')
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate()

  useEffect(() => {
    fetchMonthlySpending()
  }, [])

  useEffect(() => {
    if (startDate) fetchBudget(startDate)
  }, [startDate])

  const fetchBudget = async (dateStr) => {
    try {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const res = await axios.get(`/budget`, {
        params: { userId, year, month },
        headers: { Authorization: `Bearer ${token}` }
      })
      setBudget(res.data.budget || 0)
    } catch (err) {
      console.error('예산 조회 실패', err)
    }
  }

  const fetchMonthlySpending = async () => {
    try {
      const res = await axios.get(`/statis/getReceipt/calMonthlyTotal`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMonthlySpending(res.data || 0)
    } catch (err) {
      console.error('지출 조회 실패', err)
    }
  }

  const saveBudget = async () => {
    const date = new Date(startDate || new Date())
    const body = {
      userId: Number(userId),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      budget: Number(inputBudget)
    }

    try {
      await axios.post('/budget', body, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('예산이 저장되었습니다.')
      fetchBudget(startDate)
    } catch (err) {
      console.error(err)
      alert('예산 저장 실패')
    }
  }

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/challenge/create', {
        type: 'SAVING',
        startDate,
        endDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const id = res.data.id
      alert('절약 챌린지가 등록되었습니다.')
      navigate(`/challenges/detail/${id}`)
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || '등록 실패'
      alert(`등록 실패: ${errorMessage}`)
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">절약 챌린지</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
        >
          ← 돌아가기
        </button>
      </div>

      {/* 예산 설정 */}
      <div className="mb-6 space-y-3">
        <p className="text-gray-700 font-medium">💰 이번 달 예산 설정</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="예산 (₩)"
            value={inputBudget}
            onChange={(e) => setInputBudget(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2"
          />
          <button
            onClick={saveBudget}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded"
          >
            저장
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1 mt-2">
          <p>📌 설정된 예산: ₩{budget.toLocaleString()}</p>
          <p>📉 이번 달 지출: ₩{monthlySpending.toLocaleString()}</p>
          <p>📊 절약률: {budget > 0 ? Math.max(0, ((1 - monthlySpending / budget) * 100).toFixed(1)) : 0}%</p>
        </div>
      </div>

      {/* 챌린지 등록 */}
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          📌 예산 대비 10% 이상 절약하면 챌린지가 성공 처리되고 포인트가 지급됩니다.
        </p>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded"
        >
          챌린지 등록하기
        </button>
      </div>
    </div>
  )
}
