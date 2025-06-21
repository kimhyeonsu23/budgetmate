import React, { useState } from 'react'
import axios from 'axios'

export default function NoSpendingChallenge() {
  const [targetAmount, setTargetAmount] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      await axios.post('/challenge/create', {
        type: 'NO_SPENDING',
        targetAmount: Number(targetAmount),
        startDate,
        endDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('무지출 챌린지가 등록되었습니다.')
    } catch (err) {
      console.error(err)
      alert('등록 실패')
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">무지출 챌린지</h2>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="지출 허용 금액 (원)"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
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
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded"
        >
          챌린지 등록하기
        </button>
      </div>
    </div>
  )
}