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

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#8dd1e1']

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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center"> 내 소비 내역</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}월</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="text-gray-500">로딩 중...</span>
          </div>
        ) : (
          <>
            <div className="bg-gray-100 p-4 rounded-lg shadow">
              <p className="font-semibold">총 지출: ₩{totalSpending.toLocaleString()}</p>
              {budget !== null ? (
                <>
                  <p>예산: ₩{budget.toLocaleString()}</p>
                  <p className={totalSpending > budget ? 'text-red-500' : 'text-green-600'}>
                    {totalSpending > budget ? '⚠️ 예산 초과!' : '예산 내 지출 중입니다.'}
                  </p>
                  <div className="w-full bg-gray-300 rounded h-3 mt-2">
                    <div
                      className="bg-blue-500 h-3 rounded"
                      style={{ width: `${Math.min((totalSpending / budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">⚠️ 예산이 설정되어 있지 않습니다.</p>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">📊 카테고리별 소비</h2>
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
                      label
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

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">🧾 최근 소비 내역</h2>
              {entries.length === 0 ? (
                <p className="text-gray-500">최근 소비 내역이 없습니다.</p>
              ) : (
                <ul className="divide-y">
                  {entries.map((entry) => (
                    <li
                      key={entry.receiptId}
                      className="py-2 cursor-pointer hover:bg-gray-100 px-2 rounded"
                      onClick={() => navigate(`/ledger/${entry.date}`)}
                    >
                      <div className="flex justify-between">
                        <div>{entry.date} - {entry.shop || '상호명 없음'}</div>
                        <div>{keywordMap[entry.keywordId]} | ₩{entry.totalPrice?.toLocaleString() || 0}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
