import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Snackbar, Alert, Button as MuiButton } from '@mui/material'
import axios from 'axios'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

import NotoSansKR from '../assets/fonts/NotoSansKR.js'

import {
  ShoppingCartIcon,
  BusIcon,
  HomeIcon,
  ShirtIcon,
  HeartIcon,
  BookIcon,
  PiggyBankIcon,
  WalletIcon
} from 'lucide-react'

export default function DailyLedger() {
  const { date } = useParams()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [itemsMap, setItemsMap] = useState({})
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [deletedEntry, setDeletedEntry] = useState(null)
  const [deletedItems, setDeletedItems] = useState(null)

  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  })

  const categoryColors = {
    '외식': 'bg-pink-100 text-pink-800',
    '교통': 'bg-blue-100 text-blue-800',
    '생활비': 'bg-yellow-100 text-yellow-800',
    '쇼핑': 'bg-purple-100 text-purple-800',
    '건강': 'bg-green-100 text-green-800',
    '교육': 'bg-indigo-100 text-indigo-800',
    '저축/투자': 'bg-gray-100 text-gray-800',
    '수입': 'bg-emerald-100 text-emerald-800',
    '기타': 'bg-slate-100 text-slate-800'
  }

  const categoryIcons = {
    '외식': <ShoppingCartIcon className="w-4 h-4 inline-block mr-1" />,
    '교통': <BusIcon className="w-4 h-4 inline-block mr-1" />,
    '생활비': <HomeIcon className="w-4 h-4 inline-block mr-1" />,
    '쇼핑': <ShirtIcon className="w-4 h-4 inline-block mr-1" />,
    '건강': <HeartIcon className="w-4 h-4 inline-block mr-1" />,
    '교육': <BookIcon className="w-4 h-4 inline-block mr-1" />,
    '저축/투자': <PiggyBankIcon className="w-4 h-4 inline-block mr-1" />,
    '수입': <WalletIcon className="w-4 h-4 inline-block mr-1" />
  }

  useEffect(() => {
    async function fetchDaily() {
      try {
        const userId = localStorage.getItem('userId')
        const res = await fetch(`/receipt/ledger?userId=${userId}`)
        if (!res.ok) throw new Error('네트워크 오류')

        const catMap = {
          1: '외식', 2: '교통', 3: '생활비', 4: '쇼핑',
          5: '건강', 6: '교육', 7: '저축/투자', 8: '수입'
        }

        const data = await res.json()
        const todays = data
          .filter(item => item.date === date && !item.isDeleted)
          .map(item => ({
            id: item.receiptId,
            category: catMap[item.keywordId] || '기타',
            description: item.shop,
            amount: item.totalPrice,
            isIncome: item.keywordId === 8,
            imagePath: item.imagePath,
            date: item.date
          }))

        setEntries(todays)

        const itemsResponses = await Promise.all(
          todays.map(e =>
            fetch(`/receipt/${e.id}/items`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          )
        )
        const newItemsMap = {}
        todays.forEach((entry, idx) => {
          newItemsMap[entry.id] = itemsResponses[idx]
        })
        setItemsMap(newItemsMap)
      } catch (err) {
        console.error('상세 내역 로딩 오류:', err)
      }
    }

    fetchDaily()
  }, [date])

  const handleDelete = async (receiptId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    const entryToDelete = entries.find(e => e.id === receiptId)
    const itemsToDelete = itemsMap[receiptId]
    try {
      await axios.patch(`/receipt/${receiptId}/delete`, {}, { withCredentials: true })
      setDeletedEntry(entryToDelete)
      setDeletedItems(itemsToDelete)
      setEntries(prev => prev.filter(e => e.id !== receiptId))
      setItemsMap(prev => {
        const updated = { ...prev }
        delete updated[receiptId]
        return updated
      })
      setSnackbarOpen(true)
    } catch (err) {
      alert('삭제 실패: ' + err.message)
    }
  }

  const handleUndo = async () => {
    if (!deletedEntry) return
    try {
      await axios.patch(`/receipt/${deletedEntry.id}/restore`, {}, { withCredentials: true })
      const updated = [...entries, deletedEntry].sort((a, b) => new Date(a.date) - new Date(b.date))
      setEntries(updated)
      if (!deletedItems || deletedItems.length === 0) {
        const res = await axios.get(`/receipt/${deletedEntry.id}/items`)
        setItemsMap(prev => ({ ...prev, [deletedEntry.id]: res.data }))
      } else {
        setItemsMap(prev => ({ ...prev, [deletedEntry.id]: deletedItems }))
      }
      setDeletedEntry(null)
      setDeletedItems(null)
      setSnackbarOpen(false)
    } catch (err) {
      alert('되돌리기 실패: ' + err.message)
    }
  }

  const downloadCSV = () => {
  const rows = [['카테고리', '상호', '금액', '날짜']];

  entries.forEach(e => {
    const safeDate = `="${e.date}"`;

    //  수입/지출 항목 한 줄
    rows.push([e.category, e.description, e.amount, safeDate]);

    //  상품정보가 있으면 바로 아래에 출력
    if (itemsMap[e.id] && itemsMap[e.id].length > 0) {
      rows.push(['', '상품명', '단가', '수량', '총액']);
      itemsMap[e.id].forEach(item => {
        rows.push([
          '',
          item.itemName,
          item.unitPrice,
          item.quantity,
          item.totalPrice
        ]);
      });
    }

    //  항목 구분을 위한 빈 줄
    rows.push([]);
  });


  const csvContent = "\uFEFF" + rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${date}_가계부.csv`;
  a.click();
  URL.revokeObjectURL(url);
};


  const expenseTotal = entries.filter(e => !e.isIncome).reduce((sum, e) => sum + Math.abs(e.amount), 0)

  const downloadPDF = () => {
  const doc = new jsPDF()

  doc.addFileToVFS('NotoSansKR.ttf', NotoSansKR)
  doc.addFont('NotoSansKR.ttf', 'NotoSansKR', 'normal')
  doc.setFont('NotoSansKR')
  doc.setFontSize(18)
  doc.text(`${formattedDate} 가계부`, 14, 22)

  const tableBody = []

  tableBody.push(['카테고리', '상세 내용', '금액', '단가', '수량', '합계'])

  entries.forEach(entry => {
    tableBody.push([
      entry.category,
      entry.description,
      (entry.isIncome ? '+' : '-') + Math.abs(entry.amount).toLocaleString(),
      '', '', ''
    ])

    if (itemsMap[entry.id]?.length > 0) {
      tableBody.push(['', '상품명', '', '단가', '수량', '합계'])
      itemsMap[entry.id].forEach(item => {
        tableBody.push([
          '', item.itemName,
          '', `${item.unitPrice?.toLocaleString() || ''}`,
          `${item.quantity}`, `${item.totalPrice.toLocaleString()}`
        ])
      })
    }
  })

  autoTable(doc, {
    body: tableBody,
    startY: 30,
    showHead: 'never', 
    styles: {
      font: 'NotoSansKR',
      fontSize: 10
    },
    bodyStyles: {
      font: 'NotoSansKR'
    }
  })

  doc.setFontSize(12)
  doc.text(`총 지출: ${expenseTotal.toLocaleString()}`, 14, doc.lastAutoTable.finalY + 10)
  doc.save(`${date}_가계부.pdf`)
}


  return (
    <div className="min-h-screen bg-[#fffdf7] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-[#444]">📒 {formattedDate} 가계부</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/ledger')}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded shadow hover:bg-gray-200"
            >
              ← 돌아가기
            </button>
            <button onClick={downloadPDF} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded shadow">PDF 저장</button>
            <button onClick={downloadCSV} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded shadow">CSV 저장</button>
          </div>
        </div>

        <div id="ledger-pdf" className="bg-white px-6 py-4 rounded-lg shadow space-y-4 border border-gray-200">
          {entries.length === 0 ? (
            <div className="text-center text-gray-400 py-10">내역이 없습니다 🐣</div>
          ) : (
            entries.map(e => (
              <div
                key={e.id}
                className={`border-l-4 rounded p-4 shadow-sm ${e.isIncome ? 'border-green-400' : 'border-red-400'} bg-white`}
              >
                <div className="flex justify-between items-center text-sm text-gray-800">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center ${
                      categoryColors[e.category] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {categoryIcons[e.category]}{e.category}
                    </span>{' '}
                    <span className="font-medium ml-2">{e.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`font-bold ${e.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {e.isIncome ? '+' : '-'}₩{Math.abs(e.amount).toLocaleString()}
                    </div>
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                  </div>
                </div>
                {itemsMap[e.id]?.length > 0 && (
                  <table className="w-full text-xs mt-2 border border-gray-300 rounded">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="px-2 py-1 border">상품명</th>
                        <th className="px-2 py-1 border">단가</th>
                        <th className="px-2 py-1 border">수량</th>
                        <th className="px-2 py-1 border">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsMap[e.id].map((item, idx) => (
                        <tr key={idx} className="text-gray-700">
                          <td className="px-2 py-1 border">{item.itemName}</td>
                          <td className="px-2 py-1 border text-right">{item.unitPrice?.toLocaleString()}원</td>
                          <td className="px-2 py-1 border text-center">{item.quantity}</td>
                          <td className="px-2 py-1 border text-right">{item.totalPrice.toLocaleString()}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {e.imagePath && (
                  <img
                    src={`/receipt/image/${encodeURIComponent(e.imagePath)}`}
                    alt="영수증 원본"
                    className="mt-2 w-48 border rounded shadow"
                  />
                )}
              </div>
            ))
          )}
          {entries.length > 0 && (
            <div className="pt-6 text-sm text-gray-700 border-t border-dashed">
              <div>총 지출: <span className="text-red-600 font-bold">₩{expenseTotal.toLocaleString()}</span></div>
            </div>
          )}
        </div>
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: '100%' }}
          action={
            <MuiButton color="inherit" size="small" onClick={handleUndo}>
              되돌리기
            </MuiButton>
          }
        >
          영수증이 삭제되었습니다.
        </Alert>
      </Snackbar>
    </div>
  )
}
