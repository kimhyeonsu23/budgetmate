import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function MyInfo() {
  const [badge1, setBadge1] = useState('');
  const [badge2, setBadge2] = useState('');
  const [badge3, setBadge3] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [successRates, setSuccessRates] = useState([]);
  const userName = localStorage.getItem('userName') || '이름 없음';
  const navigate = useNavigate();

  useEffect(() => {
    fetchBadges();
    fetchMyChallenges();
  }, []);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/history/getGrantedDate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      data.forEach((badge) => {
        if (badge.badgeId === 1) setBadge1(badge.grantedDate);
        if (badge.badgeId === 2) setBadge2(badge.grantedDate);
        if (badge.badgeId === 3) setBadge3(badge.grantedDate);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyChallenges = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/challenge/my', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
        calculateSuccessRate(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const typeLabel = {
    NO_SPENDING: '무지출',
    SAVING: '절약',
    CATEGORY_LIMIT: '카테고리 제한',
  };

  const calculateSuccessRate = (data) => {
    const result = {};
    data.forEach((c) => {
      const type = typeLabel[c.type];
      if (!result[type]) result[type] = { total: 0, success: 0 };
      result[type].total++;
      if (c.success) result[type].success++;
    });
    const formatted = Object.entries(result).map(([type, { total, success }]) => ({
      type,
      successRate: Math.round((success / total) * 100),
      count: total,
    }));
    setSuccessRates(formatted);
  };

  const getStatusText = (c) => {
    const today = new Date();
    const end = new Date(c.endDate);
    if (!c.evaluated) {
      return end >= today ? '⏳ 진행 중' : '🕓 평가 대기 중';
    }
    return c.success ? '✅ 성공' : '❌ 실패';
  };

  const today = new Date();
  const ongoing = challenges.filter(c => !c.evaluated && new Date(c.endDate) >= today);
  const pendingEval = challenges.filter(c => !c.evaluated && new Date(c.endDate) < today);
  const completed = challenges.filter(c => c.evaluated);

  return (
    <main className="min-h-screen bg-white px-5 py-10 space-y-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">내 정보</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
        >
          ← 돌아가기
        </button>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">🎖️ 내 뱃지</h2>
        <div className="flex justify-center gap-6">
          {badge1 && (
            <div className="text-center">
              <img src="/badge1.png" alt="절약초보" className="w-20 mx-auto" />
              <p className="text-sm mt-1">초보 ({badge1})</p>
            </div>
          )}
          {badge2 && (
            <div className="text-center">
              <img src="/badge2.png" alt="절약고수" className="w-20 mx-auto" />
              <p className="text-sm mt-1">고수 ({badge2})</p>
            </div>
          )}
          {badge3 && (
            <div className="text-center">
              <img src="/badge3.png" alt="절약왕" className="w-20 mx-auto" />
              <p className="text-sm mt-1">왕 ({badge3})</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">🔥 진행 중인 챌린지</h2>
        {ongoing.length === 0 ? (
          <p className="text-center text-gray-500">진행 중인 챌린지가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ongoing.map((c) => (
              <div
                key={c.id}
                className="p-4 shadow rounded-xl cursor-pointer hover:shadow-md border"
                onClick={() => navigate(`/challenges/detail/${c.id}`)}
              >
                <p className="font-semibold">유형: {typeLabel[c.type]}</p>
                {c.targetCategory && <p>카테고리: {c.targetCategory}</p>}
                {c.targetAmount != null && <p>목표 금액: ₩{c.targetAmount.toLocaleString()}</p>}
                <p>기간: {c.startDate} ~ {c.endDate}</p>
                <p className="text-orange-600 font-medium">{getStatusText(c)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">📦 완료된 챌린지</h2>
        {completed.length === 0 ? (
          <p className="text-center text-gray-500">완료된 챌린지가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map((c) => (
              <div
                key={c.id}
                className="p-4 shadow rounded-xl cursor-pointer hover:shadow-md border"
                onClick={() => navigate(`/challenges/detail/${c.id}`)}
              >
                <p className="font-semibold">유형: {typeLabel[c.type]}</p>
                {c.targetCategory && <p>카테고리: {c.targetCategory}</p>}
                {c.targetAmount != null && <p>목표 금액: ₩{c.targetAmount.toLocaleString()}</p>}
                <p>기간: {c.startDate} ~ {c.endDate}</p>
                <p className={c.success ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{getStatusText(c)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">🕓 평가 대기 중 챌린지</h2>
        {pendingEval.length === 0 ? (
          <p className="text-center text-gray-500">평가 대기 중인 챌린지가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingEval.map((c) => (
              <div
                key={c.id}
                className="p-4 shadow rounded-xl cursor-pointer hover:shadow-md border"
                onClick={() => navigate(`/challenges/detail/${c.id}`)}
              >
                <p className="font-semibold">유형: {typeLabel[c.type]}</p>
                {c.targetCategory && <p>카테고리: {c.targetCategory}</p>}
                {c.targetAmount != null && <p>목표 금액: ₩{c.targetAmount.toLocaleString()}</p>}
                <p>기간: {c.startDate} ~ {c.endDate}</p>
                <p className="text-gray-500 font-medium">{getStatusText(c)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">📊 챌린지 유형별 성공률</h2>
        {successRates.length > 0 ? (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successRates} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="successRate" fill="#A5D8FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500">아직 성공한 챌린지가 없습니다.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">📈 챌린지 참여 횟수</h2>
        {successRates.length > 0 ? (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successRates} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#C4B5FD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500">챌린지 참여 이력이 없습니다.</p>
        )}
      </section>
    </main>
  );
}
