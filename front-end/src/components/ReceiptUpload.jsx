import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReceiptUpload() {
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [keywordId, setKeywordId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const savedId = localStorage.getItem('userId');
    if (savedId) setCurrentUserId(Number(savedId));
  }, []);

  const categories = [
    { id: 1, name: '외식' }, { id: 2, name: '교통' }, { id: 3, name: '생활비' },
    { id: 4, name: '쇼핑' }, { id: 5, name: '건강' }, { id: 6, name: '교육' },
    { id: 7, name: '저축/투자' }, { id: 8, name: '수입' }
  ];

  const handleOCR = async () => {
    if (!image) return alert('이미지를 선택하세요!');
    setLoadingOCR(true);

    try {
      const uploadForm = new FormData();
      uploadForm.append('image', image);
      const uploadRes = await axios.post('/receipt/image/upload', uploadForm, { withCredentials: true });
      const relativePath = uploadRes.data;
      const ocrRes = await axios.post(`/receipt/ocr?path=${encodeURIComponent(relativePath)}`, {}, { withCredentials: true });
      setOcrResult({ ...ocrRes.data, imagePath: relativePath });
      setIsEditing(false);
    } catch (err) {
      alert('OCR 요청 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingOCR(false);
    }
  };

  const handleCreateReceipt = async () => {
    if (!ocrResult || !keywordId) return alert('OCR 분석 후 카테고리를 선택하세요!');
    if (!currentUserId) return alert('로그인이 필요합니다.');

    try {
      await axios.post('/receipt/ocr/save/v2', {
        path: ocrResult.imagePath,
        userId: currentUserId,
        keywordId,
        shopName: ocrResult.shopName,
        date: ocrResult.date,
        totalPrice: ocrResult.totalPrice,
        items: ocrResult.items ?? []
      }, { withCredentials: true });

      alert('영수증 등록 완료!');
      setImage(null);
      setOcrResult(null);
      setKeywordId('');
    } catch (err) {
      alert('영수증 저장 실패: ' + err.message);
    }
  };

  const handleInputChange = (field, value) => {
    if (!ocrResult) return;
    const updated = { ...ocrResult };
    updated[field] = field === 'totalPrice' ? parseInt(value.replace(/\D/g, ''), 10) || 0 : value;
    setOcrResult(updated);
  };

  return (
    <div className="flex-grow bg-white py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-md rounded-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">영수증 등록</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">📸 영수증 촬영</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 shadow-sm"
              onChange={e => setImage(e.target.files?.[0] || null)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">🖼️ 이미지 선택</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 shadow-sm"
              onChange={e => setImage(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {image && <p className="text-green-700 text-sm text-center">✅ 선택된 파일: {image.name}</p>}

        <div className="text-center">
          <button
            onClick={handleOCR}
            disabled={loadingOCR}
            className="mt-2 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
          >
            {loadingOCR ? '분석 중...' : 'OCR 분석 시작'}
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
              <img
                src={`/receipt/image/${ocrResult.imagePath}`}
                alt="영수증"
                className="max-w-full h-auto rounded-lg border border-gray-300"
              />
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
                className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                💾 영수증 저장
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full px-4 py-2 border border-gray-400 rounded"
              >
                ✏️ {isEditing ? '수정 완료' : '영수증 수정'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
