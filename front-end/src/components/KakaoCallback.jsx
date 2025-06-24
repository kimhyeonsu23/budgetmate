import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {
  MdRestaurant, MdDirectionsBus, MdHome, MdShoppingBag,
  MdLocalHospital, MdSchool, MdSavings, MdAttachMoney
} from 'react-icons/md'
import { Card, CardContent, Typography, Button } from '@mui/material'

export default function Ledger() {
  const navigate = useNavigate()
  const today = new Date()
  const [entries, setEntries] = useState([])
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [calendarStartDate, setCalendarStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const iconMap = {
    '외식': <MdRestaurant />,
    '교통': <MdDirectionsBus />,
    '생활비': <MdHome />,
    '쇼핑': <MdShoppingBag />,
    '건강': <MdLocalHospital />,
    '교육': <MdSchool />,
    '저축/투자': <MdSavings />,
    '수입': <MdAttachMoney />
  }

  const formatDate = (date) => date.toLocaleDateString('sv-SE')
  const parseDate = (str) => {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  useEffect(() => {
    async function fetchLedger() {
      try {
        const userId = localStorage.getItem('userId')
        const res = await fetch(`/receipt/ledger?userId=${userId}`)
        const map = { 1: '외식', 2: '교통', 3: '생활비', 4: '쇼핑', 5: '건강', 6: '교육', 7: '저축/투자', 8: '수입' }
        const data = await res.json()
        const transformed = data.map(i => ({
          id: i.receiptId,
          date: formatDate(new Date(i.date)),
          category: map[i.keywordId] || '기타',
          description: i.shop,
          amount: i.totalPrice,
          isIncome: i.keywordId === 8
        }))
        setEntries(transformed)
      } catch (err) {
        console.error('가계부 로딩 오류:', err)
        setEntries([])
      }
    }
    fetchLedger()
  }, [])

  const filteredEntries = entries.filter(e => {
    const d = parseDate(e.date)
    return d.getFullYear() === selectedYear && (d.getMonth() + 1) === selectedMonth
  })

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const { date } = entry
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})

  const getWeekNumber = (date) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1)
    const day = date.getDate() + first.getDay() - 1
    return Math.floor(day / 7) + 1
  }

  const weekBounds = (() => {
    const now = new Date()
    const dow = now.getDay()
    const monday = new Date(now)
    const sunday = new Date(now)
    monday.setDate(now.getDate() - ((dow + 6) % 7))
    sunday.setDate(monday.getDate() + 6)
    return { monday, sunday }
  })()

  const thisWeekTotal = filteredEntries.filter(e => {
    const d = parseDate(e.date)
    return !e.isIncome && d >= weekBounds.monday && d <= weekBounds.sunday
  }).reduce((sum, e) => sum + Math.abs(e.amount), 0)

  const thisMonthTotal = filteredEntries.filter(e => !e.isIncome).reduce((sum, e) => sum + Math.abs(e.amount), 0)
  const thisMonthIncome = filteredEntries.filter(e => e.isIncome).reduce((sum, e) => sum + Math.abs(e.amount), 0)

  const weeklyStats = [1, 2, 3, 4, 5].map(weekNum => {
    const weekData = filteredEntries.filter(e => getWeekNumber(parseDate(e.date)) === weekNum && !e.isIncome)
    const total = weekData.reduce((sum, e) => sum + Math.abs(e.amount), 0)
    return { weekNum, total }
  })

  const tileContent = ({ date, view }) => {
    const dateStr = formatDate(date)
    if (view === 'month' && groupedEntries[dateStr]) {
      return <div className="w-1 h-1 mt-1 mx-auto bg-blue-500 rounded-full" />
    }
    return null
  }

  const navigateToDate = (date) => {
    navigate(`/ledger/${formatDate(date)}`)
  }

  const handleMonthChange = ({ activeStartDate }) => {
    const year = activeStartDate.getFullYear()
    const month = activeStartDate.getMonth() + 1
    setSelectedYear(year)
    setSelectedMonth(month)
    setCalendarStartDate(activeStartDate)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 max-w-6xl mx-auto space-y-6">

      {/* 상단 요약 정보 */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📅 {selectedYear}년 {selectedMonth}월 가계부
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <SummaryCard title="이번 주 지출" amount={thisWeekTotal} />
            <SummaryCard title="이번 달 지출" amount={thisMonthTotal} />
            <SummaryCard title="이번 달 수입" amount={thisMonthIncome} income />
          </div>
        </CardContent>
      </Card>

      {/* 달력 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📆 날짜별 소비 캘린더</Typography>
          <div className="flex justify-center">
            <Calendar
              onClickDay={navigateToDate}
              onActiveStartDateChange={handleMonthChange}
              tileContent={tileContent}
              value={calendarStartDate}
              locale="ko-KR"
            />
          </div>
        </CardContent>
      </Card>

      {/* 주차별 통계 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📊 주차별 소비</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {weeklyStats.map(({ weekNum, total }) => (
              <div key={weekNum} className="bg-indigo-50 dark:bg-indigo-800 p-4 rounded shadow text-center">
                <p className="text-sm font-medium">⏱ {weekNum}주차</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-200 mt-1">
                  ₩{total.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 소비 내역 */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6">📋 날짜별 소비 내역</Typography>
            <Button
              onClick={() => navigate('/ledger/manual')}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: '#5c6ac4',
                '&:hover': { backgroundColor: '#3f51b5' },
                textTransform: 'none',
                borderRadius: '999px',
                fontWeight: 'bold'
              }}
            >
              수동 입력
            </Button>

          </div>

          {Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a)).map(date => {
            const income = groupedEntries[date].filter(e => e.isIncome).reduce((sum, e) => sum + e.amount, 0)
            const expense = groupedEntries[date].filter(e => !e.isIncome).reduce((sum, e) => sum + Math.abs(e.amount), 0)

            return (
              <div key={date} className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Link to={`/ledger/${encodeURIComponent(date)}`} className="font-semibold hover:underline">{date}</Link>
                  <div className="text-sm text-right">
                    {income > 0 && <div className="text-green-600 dark:text-green-300">+₩{income.toLocaleString()}</div>}
                    {expense > 0 && <div className="text-red-600 dark:text-red-300">-₩{expense.toLocaleString()}</div>}
                  </div>
                </div>
                <ul className="space-y-1">
                  {groupedEntries[date].map(entry => (
                    <li key={entry.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {iconMap[entry.category]} {entry.category}
                        </span>
                        <span>{entry.description}</span>
                      </div>
                      <span className={entry.isIncome ? 'text-green-600' : 'text-red-600'}>
                        {entry.isIncome ? '+' : '-'}₩{Math.abs(entry.amount).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ title, amount, income }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-inner text-center">
      <Typography variant="body2" color="textSecondary">{title}</Typography>
      <Typography variant="h6" color={income ? 'green' : 'error'} sx={{ mt: 1 }}>
        {income ? '+' : '-'}₩{amount.toLocaleString()}
      </Typography>
    </div>
  )
}
