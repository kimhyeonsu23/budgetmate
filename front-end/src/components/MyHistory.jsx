import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'

export default function MyHistory() {
  const [entries, setEntries] = useState([])
  const [categoryStats, setCategoryStats] = useState({})
  const [totalSpending, setTotalSpending] = useState(0)
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('accessToken')
  const navigate = useNavigate()

  const keywordMap = {
    1: '외식', 2: '교통', 3: '생활비', 4: '쇼핑',
    5: '건강', 6: '교육', 7: '저축/투자', 8: '수입'
  }

  const COLORS = ['#a5b4fc', '#c4b5fd', '#fbcfe8', '#fcd34d', '#6ee7b7', '#fdba74', '#fda4af']

  useEffect(() => {
    fetchAllData(selectedYear, selectedMonth)
  }, [selectedYear, selectedMonth])

  const fetchAllData = async (year, month) => {
    setLoading(true)
    try {
      await Promise.all([
        fetchMonthlyStats(year, month),
        fetchLedger(year, month)
      ])
    } catch (err) {
      console.error('데이터 불러오기 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyStats = async (year, month) => {
    if (!token) return
    const res = await fetch(`/statis/getReceipt/monthlyStats?year=${year}&month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setCategoryStats(data.categoryStats || {})
    setTotalSpending(data.totalSpending || 0)
    setBudget(data.budget ?? null)
  }

  const fetchLedger = async (year, month) => {
    const res = await fetch(`/receipt/ledger?userId=${userId}&year=${year}&month=${month}`)
    const data = await res.json()
    setEntries(data)
  }

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 요기 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">내 소비 내역</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
          >
            ← 돌아가기
          </button>
        </div>

        {/* 월/연도 선택 */}
        <div className="flex gap-4 justify-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}월</option>
            ))}
          </select>
        </div>

        {/* 예산 요약 */}
        <div className="bg-gray-100 rounded-xl shadow-md p-5 space-y-2">
          <p className="font-semibold text-gray-800">총 지출: ₩{totalSpending.toLocaleString()}</p>
          {budget !== null ? (
            <>
              <p className="text-gray-700">예산: ₩{budget.toLocaleString()}</p>
              <p className={totalSpending > budget ? 'text-red-500' : 'text-green-600'}>
                {totalSpending > budget ? '⚠️ 예산 초과!' : '예산 내 지출 중입니다.'}
              </p>
              <div className="w-full bg-gray-300 rounded h-2 mt-2">
                <div
                  className="bg-indigo-400 h-2 rounded"
                  style={{ width: `${Math.min((totalSpending / budget) * 100, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-gray-500">⚠️ 예산이 설정되어 있지 않습니다.</p>
          )}
        </div>

        {/* 카테고리별 소비 */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">📊 카테고리별 소비</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(categoryStats).map(([name, amount]) => ({
                    categoryName: name,
                    totalAmount: amount,
                  }))}
                  dataKey="totalAmount"
                  nameKey="categoryName"
                  outerRadius={100}
                >
                  {Object.entries(categoryStats).map(([_, __], index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 소비 내역 */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">🧾 최근 소비 내역</h2>
          {entries.length === 0 ? (
            <p className="text-gray-500">최근 소비 내역이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <li
                  key={entry.receiptId}
                  className="py-3 px-2 cursor-pointer hover:bg-gray-50 transition rounded-md"
                  onClick={() => navigate(`/ledger/${entry.date}`)}
                >
                  <div className="flex justify-between text-sm text-gray-700">
                    <div>{entry.date} - {entry.shop || '상호명 없음'}</div>
                    <div className="font-medium">
                      {keywordMap[entry.keywordId]} | ₩{entry.totalPrice?.toLocaleString() || 0}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
