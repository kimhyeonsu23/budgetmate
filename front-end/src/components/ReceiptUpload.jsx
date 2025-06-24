import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function ReceiptUpload() {
  const [image, setImage] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const [keywordId, setKeywordId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loadingOCR, setLoadingOCR] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    const savedId = localStorage.getItem('userId')
    if (savedId) setCurrentUserId(Number(savedId))
  }, [])

  const categories = [
    { id: 1, name: '외식' }, { id: 2, name: '교통' }, { id: 3, name: '생활비' },
    { id: 4, name: '쇼핑' }, { id: 5, name: '건강' }, { id: 6, name: '교육' },
    { id: 7, name: '저축/투자' }, { id: 8, name: '수입' }
  ]

  const handleOCR = async () => {
    if (!image) return alert('이미지를 선택하세요!')
    setLoadingOCR(true)
    try {
      const form = new FormData()
      form.append('image', image)
      const uploadRes = await axios.post('/receipt/image/upload', form, { withCredentials: true })
      const relativePath = uploadRes.data
      const ocrRes = await axios.post(`/receipt/ocr?path=${encodeURIComponent(relativePath)}`, {}, { withCredentials: true })
      setOcrResult({ ...ocrRes.data, imagePath: relativePath })
      setIsEditing(false)
    } catch (err) {
      alert('OCR 요청 실패: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoadingOCR(false)
    }
  }

  const handleCreateReceipt = async () => {
    if (!ocrResult || !keywordId) return alert('OCR 분석 후 카테고리를 선택하세요!')
    if (!currentUserId) return alert('로그인이 필요합니다.')
    try {
      await axios.post('/receipt/ocr/save/v2', {
        path: ocrResult.imagePath,
        userId: currentUserId,
        keywordId,
        shopName: ocrResult.shopName,
        date: ocrResult.date,
        totalPrice: ocrResult.totalPrice,
        items: ocrResult.items ?? []
      }, { withCredentials: true })

      alert('영수증 등록 완료!')
      setImage(null)
      setOcrResult(null)
      setKeywordId('')
    } catch (err) {
      alert('영수증 저장 실패: ' + err.message)
    }
  }

  const handleInputChange = (field, value) => {
    if (!ocrResult) return
    const updated = { ...ocrResult }
    updated[field] = field === 'totalPrice' ? parseInt(value.replace(/\D/g, ''), 10) || 0 : value
    setOcrResult(updated)
  }
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-start justify-center">
      <div className="w-full max-w-2xl space-y-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 text-center">영수증 등록</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="w-full">
            <span className="block text-sm font-medium text-gray-700 mb-1">📸 촬영하기</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e => setImage(e.target.files?.[0] || null)}
              className="w-full border px-4 py-2 rounded-md text-sm shadow-sm"
            />
          </label>

          <label className="w-full">
            <span className="block text-sm font-medium text-gray-700 mb-1">🖼 갤러리에서 선택</span>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files?.[0] || null)}
              className="w-full border px-4 py-2 rounded-md text-sm shadow-sm"
            />
          </label>
        </div>

        {image && (
          <p className="text-xs text-green-600 mt-2 text-center">선택된 파일: {image.name}</p>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleOCR}
            disabled={loadingOCR}
            className="w-full px-5 py-2 text-white font-medium rounded-md transition"
            style={{ backgroundColor: '#5c6ac4', opacity: loadingOCR ? 0.6 : 1 }}
          >
            {loadingOCR ? '분석 중...' : '📄 OCR 분석 시작'}
          </button>

          <button
            onClick={() => window.location.href = '/ledger/manual'}
            className="w-full px-5 py-2 text-white font-medium rounded-md transition"
            style={{ backgroundColor: '#5c6ac4' }}
          >
            ✍️ 수동 입력으로 등록하기
          </button>
        </div>

        {ocrResult && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">📄 OCR 결과</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-gray-600 hover:underline"
              >
                {isEditing ? '수정 완료' : '영수증 수정'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isEditing ? (
                <>
                  <input className="w-full border px-3 py-2 rounded" value={ocrResult.shopName} onChange={e => handleInputChange('shopName', e.target.value)} />
                  <input className="w-full border px-3 py-2 rounded" type="date" value={ocrResult.date} onChange={e => handleInputChange('date', e.target.value)} />
                  <input className="w-full border px-3 py-2 rounded" value={ocrResult.totalPrice} onChange={e => handleInputChange('totalPrice', e.target.value)} />
                </>
              ) : (
                <>
                  <p><strong>상호명:</strong> {ocrResult.shopName}</p>
                  <p><strong>날짜:</strong> {ocrResult.date}</p>
                  <p><strong>금액:</strong> ₩{ocrResult.totalPrice.toLocaleString()}</p>
                </>
              )}
            </div>

            {ocrResult.imagePath && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">🖼 인식된 이미지</h3>
                <img
                  src={`/receipt/image/${ocrResult.imagePath}`}
                  alt="영수증 미리보기"
                  className="w-full max-w-xs mx-auto rounded-lg border shadow"
                />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🛍️ 인식된 항목</h3>
              {ocrResult.items?.length > 0 ? (
                <div className="space-y-2">
                  {ocrResult.items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2">
                      {isEditing ? (
                        <>
                          <input className="border px-2 py-1 rounded" value={item.itemName} onChange={e => {
                            const updated = [...ocrResult.items];
                            updated[idx].itemName = e.target.value;
                            setOcrResult({ ...ocrResult, items: updated });
                          }} />
                          <input className="border px-2 py-1 w-16 rounded" type="number" value={item.quantity} onChange={e => {
                            const updated = [...ocrResult.items];
                            updated[idx].quantity = parseInt(e.target.value) || 0;
                            updated[idx].totalPrice = updated[idx].quantity * updated[idx].unitPrice;
                            setOcrResult({ ...ocrResult, items: updated });
                          }} />
                          <input className="border px-2 py-1 w-20 rounded" type="number" value={item.unitPrice} onChange={e => {
                            const updated = [...ocrResult.items];
                            updated[idx].unitPrice = parseInt(e.target.value) || 0;
                            updated[idx].totalPrice = updated[idx].quantity * updated[idx].unitPrice;
                            setOcrResult({ ...ocrResult, items: updated });
                          }} />
                          <span>= ₩{(item.unitPrice * item.quantity).toLocaleString()}</span>
                        </>
                      ) : (
                        <span>{item.itemName} - {item.quantity}개 × ₩{item.unitPrice.toLocaleString()} = ₩{item.totalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">인식된 항목이 없습니다.</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">카테고리 선택</label>
              <select
                value={keywordId}
                onChange={e => setKeywordId(e.target.value)}
                className="w-full border px-3 py-2 rounded shadow-sm"
              >
                <option value="">선택하세요</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleCreateReceipt}
                className="w-full px-4 py-2 rounded-md font-bold text-white"
                style={{ backgroundColor: '#5c6ac4' }}
              >
                💾 영수증 저장
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full px-4 py-2 border border-gray-400 rounded-md font-semibold"
              >
                ✏️ {isEditing ? '수정 완료' : '영수증 수정'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
