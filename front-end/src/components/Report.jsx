import React, { useEffect, useState, useRef } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Report() {
  const [categoryStats, setCategoryStats] = useState({});
  const [totalSpending, setTotalSpending] = useState(0);
  const [budget, setBudget] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [challenges, setChallenges] = useState([]);

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#ed87d2', '#FA8042', '#F13342', '#b86bd6'];

  useEffect(() => {
    fetchMonthlyStats(selectedYear, selectedMonth);
    fetchMyChallenges();
  }, [selectedYear, selectedMonth]);

  const fetchMonthlyStats = async (year, month) => {
    try {
      const res = await fetch(`/statis/getReceipt/monthlyStats?year=${year}&month=${month}`, { headers });
      const data = await res.json();
      setCategoryStats(data.categoryStats || {});
      setTotalSpending(data.totalSpending || 0);
      setBudget(data.budget ?? null);

      const recommendRes = await fetch('/statis/getReceipt/recommendCategory', { headers });
      const recommendData = await recommendRes.json();
      setRecommendation(recommendData);
    } catch (err) {
      console.error('🔥 소비 리포트 에러:', err);
    }
  };

  const fetchMyChallenges = async () => {
    try {
      const res = await fetch('/challenge/my', { headers });
      if (res.ok) {
        const data = await res.json();
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const monthlyChallenges = data.filter(c => c.startDate.startsWith(monthStr));
        setChallenges(monthlyChallenges);
      }
    } catch (err) {
      console.error('🔥 챌린지 리포트 에러:', err);
    }
  };

  const formattedData = Object.entries(categoryStats).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  })).sort((a, b) => b.value - a.value);

  const top3 = formattedData.slice(0, 3);
  const savingRate = budget > 0 ? Math.max(0, 100 - (totalSpending / budget) * 100).toFixed(1) : 0;
  const isOverBudget = budget !== null && totalSpending > budget;

  const downloadPDF = async () => {
    const element = document.getElementById('report-wrapper');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Report_${selectedYear}-${String(selectedMonth).padStart(2, '0')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white p-6 space-y-6" id="report-wrapper">
      <h1 className="text-2xl font-bold text-center">소비 리포트</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="border rounded px-3 py-2">
          {[2023, 2024, 2025].map((y) => (<option key={y} value={y}>{y}년</option>))}
        </select>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="border rounded px-3 py-2">
          {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}월</option>))}
        </select>
        <button onClick={downloadPDF} className="col-span-2 md:col-span-1 bg-blue-500 text-white rounded px-3 py-2 hover:bg-blue-600">
          PDF 저장
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow space-y-2">
        <p className="font-semibold">총 지출: ₩{totalSpending.toLocaleString()}</p>
        {budget !== null ? (
          <>
            <p>예산: ₩{budget.toLocaleString()}</p>
            <p className={isOverBudget ? 'text-red-500' : 'text-green-600'}>
              {isOverBudget ? '⚠️ 예산 초과!' : '예산 내 지출 중입니다.'}
            </p>
            <div className="w-full bg-gray-300 rounded h-3">
              <div className="bg-blue-500 h-3 rounded" style={{ width: `${savingRate}%` }}></div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">⚠️ 예산이 설정되어 있지 않습니다.</p>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">📊 카테고리별 소비 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={formattedData} dataKey="value" nameKey="name" outerRadius={80} label={false}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value">
                {formattedData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {top3.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🔻 Top 3 소비 카테고리</h2>
          <ul className="list-disc pl-6 text-gray-700">
            {top3.map((item, i) => (
              <li key={i}>{item.name}: ₩{item.value.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendation && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md">
          <p className="font-bold">💬 절약 피드백</p>
          <p className="mt-1">⚠️ {recommendation.overspentCategory} 지출이 많습니다.</p>
          <p className="text-sm mt-1">{recommendation.reason}</p>
        </div>
      )}

      {challenges.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🏆 이번 달 챌린지 요약</h2>
          <ul className="list-disc pl-6 text-gray-700">
            {challenges.map((c, i) => (
              <li key={i}>
                {c.type === 'NO_SPENDING' && '무지출'}
                {c.type === 'SAVING' && '절약'}
                {c.type === 'CATEGORY_LIMIT' && '카테고리 제한'} 챌린지:
                {' '}
                {new Date(c.endDate) >= new Date() ? '⏳ 진행 중' : c.success ? '✅ 성공' : '❌ 실패'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
