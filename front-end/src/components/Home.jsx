import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis
} from 'recharts';
import html2canvas from 'html2canvas';
import {
  Card, CardContent, Typography, Button as MUIButton
} from '@mui/material';

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [weeklyCategory, setWeeklyCategory] = useState({});
  const [monthlyCategory, setMonthlyCategory] = useState({});
  const [currentWeek, setCurrentWeek] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [budget, setBudget] = useState(0);
  const [recommendation, setRecommendation] = useState(null);
  const [entries, setEntries] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [tip, setTip] = useState('');

  const COLORS = ['#A3B9D9', '#B8D8BA', '#FFE299', '#FFCDD2', '#C5C6F2', '#FFE9B2', '#C5F6E5'];
  const EMOJIS = ['🍔', '🚌', '🏠', '🛍️', '🏥', '📚', '💰'];
  const tips = [
    "💡 불필요한 구독 서비스는 해지해보세요!",
    "🍱 외식보다는 집밥으로 절약해요!",
    "♻️ 중고 거래를 활용해보세요!",
    "🚇 대중교통을 이용해 교통비를 줄여요!",
    "🛒 장보기 목록을 작성해 낭비를 줄여요!"
  ];

  const keywordMap = {
    1: '외식', 2: '교통', 3: '생활비', 4: '쇼핑',
    5: '건강', 6: '교육', 7: '저축/투자', 8: '수입'
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setUserName(localStorage.getItem('userName') || '');
    if (!token) return navigate('/');
    fetchData();
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const now = new Date();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [week, month, budgetRes, weekCat, monthCat, ledgerRes, challengeRes, recommendRes] =
        await Promise.all([
          fetch('/statis/getReceipt/calCurrentWeek', { headers }),
          fetch('/statis/getReceipt/calMonthlyTotal', { headers }),
          fetch(`/budget?userId=${userId}&year=${now.getFullYear()}&month=${now.getMonth() + 1}`),
          fetch('/statis/getReceipt/calKeywordTotalPriceWeekly', { headers }),
          fetch('/statis/getReceipt/calKeywordTotalPrice', { headers }),
          fetch(`/receipt/ledger?userId=${userId}`),
          fetch('/challenge/my', { headers }),
          fetch('/statis/getReceipt/recommendCategory', { headers })
        ]);

      setCurrentWeek(await week.json());
      setMonthlySpending(await month.json());
      const budgetJson = await budgetRes.json();
      setBudget(budgetJson.budget);
      setWeeklyCategory(await weekCat.json());
      setMonthlyCategory(await monthCat.json());
      setEntries(transformLedger(await ledgerRes.json()));
      setChallenges((await challengeRes.json()).filter(c => new Date(c.endDate) >= new Date()));
      setRecommendation(await recommendRes.json());
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  const transformLedger = (data) =>
    data.map(e => ({
      id: e.receiptId,
      category: keywordMap[e.keywordId] || '기타',
      description: e.shop || '상호명 없음',
      amount: e.totalPrice,
      date: e.date,
      isIncome: e.keywordId === 8
    }));

  const today = new Date();
  const remainingDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
  const availableToday = budget > 0 ? Math.max(Math.floor((budget - monthlySpending) / remainingDays), 0) : 0;
  const forecastDate = () => {
    if (monthlySpending >= budget || availableToday === 0) return '초과됨';
    const daysLeft = Math.floor((budget - monthlySpending) / availableToday);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() + daysLeft);
    const month = expectedDate.getMonth() + 1;
    const day = expectedDate.getDate();
    return `${month}월 ${day}일`;
  };

  const forecast = forecastDate();
  const savingRate = budget > 0 ? Math.max(0, Math.floor(((budget - monthlySpending) / budget) * 100)) : 0;
  const topCategory = Object.entries(monthlyCategory).reduce((a, b) => b[1] > (a?.[1] || 0) ? b : a, null);
  const pieData = (obj) => Object.entries(obj).map(([k, v], i) => ({ name: k, value: v, emoji: EMOJIS[i % EMOJIS.length] }));
  const lineData = entries.reduce((acc, e) => {
    const found = acc.find(d => d.date === e.date);
    found ? found.amount += e.amount : acc.push({ date: e.date, amount: e.amount });
    return acc;
  }, []);
  return (
    <div className="bg-gray-50 min-h-screen p-4 space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🤝 <span className="text-indigo-700">{userName}</span>님, 환영합니다
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            이번 달 예산: <strong>₩{budget.toLocaleString()}</strong>
          </Typography>
          <Typography variant="body1">
            총 지출: <strong>₩{monthlySpending.toLocaleString()}</strong>
          </Typography>
          <Typography variant="body1">
            오늘 사용 가능 금액: <strong>₩{availableToday.toLocaleString()}</strong>
          </Typography>
          <Typography variant="body1">
            예산 소진 예상일: <strong>{forecast}</strong>
          </Typography>

          <div className="w-full bg-gray-200 rounded-full h-6 mt-2 relative">
            <div
              className={`${monthlySpending > budget ? 'bg-red-500' : 'bg-indigo-400'} h-6 rounded-full`}
              style={{ width: `${savingRate}%` }}
            />
            <span className="absolute inset-0 text-center text-sm font-semibold leading-6 text-black">
              {savingRate}%
            </span>
          </div>

          {budget > 0 && monthlySpending > budget && recommendation && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mt-2 rounded-md shadow">
              <p className="font-bold">⚠️ 소비 경고: {recommendation.overspentCategory}</p>
              <p className="text-sm mt-1 mb-3">{recommendation.reason}</p>
              <MUIButton
                onClick={() => navigate('/report')}
                variant="contained"
                color="error"
                size="small"
              >
                소비 리포트 보기
              </MUIButton>
            </div>
          )}
        </CardContent>
      </Card>

      {challenges.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🧭 진행 중인 챌린지</Typography>
            <ul className="space-y-2 text-sm">
              {challenges.map((c) => {
                const commonStyle = 'bg-gray-100 border border-gray-300 text-gray-800';

                return (
                  <li
                    key={c.id}
                    onClick={() => navigate(`/challenges/detail/${c.id}`)}
                    className={`rounded p-2 cursor-pointer hover:bg-gray-200 transition ${commonStyle}`}
                  >
                    ⏳ {c.type} | {c.startDate} ~ {c.endDate}
                  </li>
                );
              })}
            </ul>


          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChartCard title="🧮 이번 주 소비 분포" data={weeklyCategory} />
        <PieChartCard title="🧮 이번 달 소비 분포" data={monthlyCategory} />
      </div>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📉 일자별 소비 추이</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₩${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="#5c6ac4" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {topCategory && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🪙 과소비 카테고리</Typography>
            <Typography variant="body2">
              {topCategory[0]}에 ₩{topCategory[1].toLocaleString()} 사용했습니다.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>🧠 절약 팁</Typography>
          <Typography variant="body2">{tip}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📋 최근 소비 내역</Typography>
          <ul className="space-y-1 text-sm">
            {entries.slice(-3).reverse().map(e => (
              <li key={e.id} className="flex justify-between border-b py-1">
                <span>{e.description} ({e.category})</span>
                <span className="text-red-600">-₩{e.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="text-right mt-2">
            <MUIButton
              size="small"
              onClick={() => navigate('/ledger')}
              sx={{ textTransform: 'none' }}
            >
              전체 보기 →
            </MUIButton>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <MUIButton
          onClick={() => navigate('/report')}
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
          소비 리포트 보기
        </MUIButton>
      </div>
    </div>
  );
}

function PieChartCard({ title, data }) {
  const COLORS = ['#A3B9D9', '#B8D8BA', '#FFE299', '#FFCDD2', '#C5C6F2', '#FFE9B2', '#C5F6E5'];
  const chartRef = useRef(null);

  const formatted = Object.entries(data)
    .map(([k, v], i) => ({
      name: k,
      value: v,
      emoji: ['🍔', '🚌', '🏠', '🛍️', '🏥', '📚', '💰'][i % 7]
    }))
    .filter(d => d.value > 0);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement('a');
    link.download = `${title}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card ref={chartRef}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatted}
                cx="50%" cy="50%" outerRadius={100}
                label={false}
                dataKey="value"
              >
                {formatted.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`₩${value.toLocaleString()}`, `${props.payload.emoji} ${name}`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {formatted.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span>{entry.emoji} {entry.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <MUIButton
            onClick={handleDownload}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            이미지 저장
          </MUIButton>
        </div>
      </CardContent>
    </Card>
  );
}
