import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function CategoryLimitChallenge() {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const categoryOptions = ['외식', '교통', '생활비', '쇼핑', '건강', '교육', '저축/투자']
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await axios.post(
        '/challenge/create',
        {
          type: 'CATEGORY_LIMIT',
          targetCategory: category,
          targetAmount: Number(amount),
          startDate,
          endDate
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const id = res.data.id
      alert('카테고리 제한 챌린지가 등록되었습니다.')
      navigate(`/challenges/detail/${id}`)
    } catch (err) {
      console.error(err)
      alert('등록 실패')
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-md w-full mx-auto border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">📌 카테고리 제한 챌린지</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
        >
          ← 돌아가기
        </button>
      </div>

      <div className="space-y-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">카테고리 선택</option>
          {categoryOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="지출 상한 금액 (원)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md transition duration-150"
        >
          챌린지 등록하기
        </button>
      </div>
    </div>
  )
}
