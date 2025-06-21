import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Box, Typography, TextField, Button } from '@mui/material'

export default function SavingChallenge() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [inputBudget, setInputBudget] = useState('')
  const [budget, setBudget] = useState(0)
  const [monthlySpending, setMonthlySpending] = useState(0)

  const token = localStorage.getItem('accessToken')
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    fetchBudget()
    fetchMonthlySpending()
  }, [])

  const fetchBudget = async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    try {
      const res = await axios.get(`http://localhost:8080/budget`, {
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
      const res = await axios.get(`http://localhost:8080/statis/getReceipt/calMonthlyTotal`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMonthlySpending(res.data || 0)
    } catch (err) {
      console.error('지출 조회 실패', err)
    }
  }

  const saveBudget = async () => {
    const now = new Date()
    const body = {
      userId: Number(userId),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      budget: Number(inputBudget)
    }

    try {
      await axios.post('http://localhost:8080/budget', body, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('예산이 저장되었습니다.')
      fetchBudget()
    } catch (err) {
      console.error(err)
      alert('예산 저장 실패')
    }
  }

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8080/challenge/create', {
        type: 'SAVING',
        startDate,
        endDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('절약 챌린지가 등록되었습니다.')
    } catch (err) {
      console.error(err)
      alert('등록 실패')
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">절약 챌린지</h2>

      {/* 예산 설정 */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">💰 이번 달 예산 설정</Typography>
        <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
          <TextField
            label="예산 (₩)"
            variant="outlined"
            type="number"
            value={inputBudget}
            onChange={(e) => setInputBudget(e.target.value)}
            size="small"
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={saveBudget}>저장</Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography>📌 설정된 예산: ₩{budget.toLocaleString()}</Typography>
          <Typography>📉 이번 달 지출: ₩{monthlySpending.toLocaleString()}</Typography>
          <Typography>📊 절약률: {
            budget > 0 ? Math.max(0, ((1 - monthlySpending / budget) * 100).toFixed(1)) : 0
          }%</Typography>
        </Box>
      </Box>

      {/* 챌린지 등록 */}
      <div className="space-y-4">
        <Typography className="text-sm text-gray-600">
          📌 예산 대비 10% 이상 절약하면 챌린지가 성공 처리되고 포인트가 지급됩니다.
        </Typography>

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
