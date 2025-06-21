import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [weeklyCategory, setWeeklyCategory] = useState({});
  const [monthlyCategory, setMonthlyCategory] = useState({});
  const [currentWeek, setCurrentWeek] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [budget, setBudget] = useState(0);
  const [recommendation, setRecommendation] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#ed87d2', '#FA8042', '#F13342', '#b86bd6'];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setUserName(localStorage.getItem('userName') || '');
    if (!token) return navigate('/');
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const now = new Date();
    const headers = { Authorization: `Bearer ${token}` };

    const endpoints = [
      { label: '이번주 지출', url: '/statis/getReceipt/calCurrentWeek' },
      { label: '이번달 지출', url: '/statis/getReceipt/calMonthlyTotal' },
      { label: '예산', url: `/budget?userId=${userId}&year=${now.getFullYear()}&month=${now.getMonth() + 1}` },
      { label: '이번주 카테고리', url: '/statis/getReceipt/calKeywordTotalPriceWeekly' },
      { label: '이번달 카테고리', url: '/statis/getReceipt/calKeywordTotalPrice' },
    ];

    for (const endpoint of endpoints) {
      try {
        const isBudget = endpoint.url.startsWith('/budget');
        const res = await fetch(endpoint.url, isBudget ? {} : { headers });
        const contentType = res.headers.get('content-type');
        const raw = await res.text();
        if (!res.ok || !contentType || !contentType.includes('application/json')) continue;
        const data = JSON.parse(raw);
        switch (endpoint.label) {
          case '이번주 지출': setCurrentWeek(Number(data)); break;
          case '이번달 지출': setMonthlySpending(Number(data)); break;
          case '예산': setBudget(data.budget); break;
          case '이번주 카테고리': setWeeklyCategory(data); break;
          case '이번달 카테고리': setMonthlyCategory(data); break;
        }
      } catch (err) {
        console.error(`[${endpoint.label}] 에러`, err);
      }
    }

    try {
      const recommendRes = await fetch('/statis/getReceipt/recommendCategory', { headers });
      const recommendJson = await recommendRes.json();
      setRecommendation(recommendJson);
    } catch (err) {
      console.error("추천 카테고리 에러", err);
    }
  };

  const formatCategoryData = (categoryObj) => {
    if (!categoryObj || Object.keys(categoryObj).length === 0) return [];
    const emoji = {
      '외식': '🍔', '교통비': '🚍', '생활비': '🛒',
      '쇼핑': '👕', '건강': '🏥', '교육': '✏️', '저축/투자': '💴'
    };
    return Object.entries(categoryObj)
      .map(([name, value]) => ({ name, value, img: emoji[name] || '' }))
      .filter(d => d.value > 0);
  };

  const PieChartCard = ({ title, data }) => {
    const formattedData = formatCategoryData(data);
    const chartRef = useRef(null);

    const handleDownload = async () => {
      if (!chartRef.current) return;
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `${title}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    return (
      <div className="bg-white rounded-lg p-4 shadow" ref={chartRef}>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%" cy="50%" outerRadius={100}
                label={false}
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [`₩${value.toLocaleString()}`, `${props.payload.img || ''} ${name}`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {formattedData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span>{entry.img} {entry.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-semibold rounded"
          >
            이미지 저장
          </button>
        </div>
      </div>
    );
  };

  const savingRate = budget > 0 ? Math.max(0, 100 - (monthlySpending / budget) * 100).toFixed(1) : 0;
  const overAmount = monthlySpending - budget;
  const isOverBudget = overAmount > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="이번 주 지출" amount={currentWeek} />
          <SummaryCard title="이번 달 지출" amount={monthlySpending} />
          <SummaryCard title="이번 달 예산 설정 금액" amount={budget} noPlus />
        </div>

        {budget > 0 && (
          <div className="bg-white rounded-lg p-4 shadow space-y-2">
            <h2 className="text-lg font-semibold mb-1">📉 절약률</h2>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`${isOverBudget ? 'bg-red-500' : 'bg-green-500'} h-6 rounded-full text-white text-sm text-center`}
                style={{ width: `${savingRate}%` }}
              >
                {savingRate}%
              </div>
            </div>
            {isOverBudget && recommendation && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mt-2 rounded-md shadow">
                <p className="font-bold">⚠️ 소비 경고: {recommendation.overspentCategory}</p>
                <p className="text-sm mt-1 mb-3">{recommendation.reason}</p>
                <button
                  onClick={() => navigate('/report')}
                  className="mt-2 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600"
                >
                  소비 리포트 보기
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PieChartCard title="📊 이번 주 소비 분포" data={weeklyCategory} />
          <PieChartCard title="📊 이번 달 소비 분포" data={monthlyCategory} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate('/receipt')}
            className="w-full px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 font-semibold rounded-lg"
          >
            영수증 등록
          </button>
          <button
            onClick={() => navigate('/ledger/manual')}
            className="w-full px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-semibold rounded-lg"
          >
            수동 가계부 입력
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, amount, income, noPlus }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-inner text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${income ? 'text-green-600' : 'text-red-600'}`}>
        {noPlus ? '' : income ? '+' : '-'}₩{amount.toLocaleString()}
      </p>
    </div>
  );
}
