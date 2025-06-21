import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button, Divider, Typography, Paper, Box, Grid } from '@mui/material';
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
      const res = await fetch('http://localhost:8080/history/getGrantedDate', {
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
      const res = await fetch('http://localhost:8080/challenge/my', {
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
    if (new Date(c.endDate) >= new Date()) return '⏳ 진행 중';
    return c.success ? '✅ 성공' : '❌ 실패';
  };

  const ongoing = challenges.filter(c => new Date(c.endDate) >= new Date());
  const completed = challenges.filter(c => new Date(c.endDate) < new Date());

  return (
    <Box className="bg-white px-6 py-10 max-w-6xl mx-auto space-y-16">
      <Box textAlign="center">
        <Typography variant="h4" fontWeight={600}>내 정보</Typography>
        <Typography variant="subtitle1" color="text.secondary" mt={1}>👤 사용자 이름: {userName}</Typography>
      </Box>

      <section>
        <Typography variant="h5" color="primary" textAlign="center" gutterBottom>🎖️ 내 뱃지</Typography>
        <Grid container spacing={4} justifyContent="center">
          {badge1 && (
            <Grid item>
              <Paper elevation={3} className="p-4 text-center">
                <img src="/badge1.png" alt="절약초보" className="w-24 mx-auto" />
                <Typography variant="body2" mt={1}>초보 ({badge1})</Typography>
              </Paper>
            </Grid>
          )}
          {badge2 && (
            <Grid item>
              <Paper elevation={3} className="p-4 text-center">
                <img src="/badge2.png" alt="절약고수" className="w-24 mx-auto" />
                <Typography variant="body2" mt={1}>고수 ({badge2})</Typography>
              </Paper>
            </Grid>
          )}
          {badge3 && (
            <Grid item>
              <Paper elevation={3} className="p-4 text-center">
                <img src="/badge3.png" alt="절약왕" className="w-24 mx-auto" />
                <Typography variant="body2" mt={1}>왕 ({badge3})</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </section>

      <section>
        <Typography variant="h5" color="primary" textAlign="center" gutterBottom>🔥 진행 중인 챌린지</Typography>
        {ongoing.length === 0 ? (
          <Typography align="center" color="text.secondary">진행 중인 챌린지가 없습니다.</Typography>
        ) : (
          <Grid container spacing={2}>
            {ongoing.map((c) => (
              <Grid item xs={12} md={6} key={c.id}>
                <Paper className="p-4 shadow rounded-lg">
                  <Typography fontWeight={500}>유형: {typeLabel[c.type]}</Typography>
                  {c.targetCategory && <Typography>카테고리: {c.targetCategory}</Typography>}
                  {c.targetAmount != null && <Typography>목표 금액: {c.targetAmount.toLocaleString()}원</Typography>}
                  <Typography>기간: {c.startDate} ~ {c.endDate}</Typography>
                  <Typography className="text-orange-600 font-medium">{getStatusText(c)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </section>

      <section>
        <Typography variant="h5" color="primary" textAlign="center" gutterBottom>📦 완료된 챌린지</Typography>
        {completed.length === 0 ? (
          <Typography align="center" color="text.secondary">완료된 챌린지가 없습니다.</Typography>
        ) : (
          <Grid container spacing={2}>
            {completed.map((c) => (
              <Grid item xs={12} md={6} key={c.id}>
                <Paper className="p-4 shadow rounded-lg">
                  <Typography fontWeight={500}>유형: {typeLabel[c.type]}</Typography>
                  {c.targetCategory && <Typography>카테고리: {c.targetCategory}</Typography>}
                  {c.targetAmount != null && <Typography>목표 금액: {c.targetAmount.toLocaleString()}원</Typography>}
                  <Typography>기간: {c.startDate} ~ {c.endDate}</Typography>
                  <Typography className={c.success ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{getStatusText(c)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </section>

      <section>
        <Typography variant="h5" color="primary" textAlign="center" gutterBottom>📊 챌린지 유형별 성공률</Typography>
        {successRates.length > 0 ? (
          <Box className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successRates} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="successRate" fill="#4caf50" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography align="center" color="text.secondary">아직 성공한 챌린지가 없습니다.</Typography>
        )}
      </section>

      <section>
        <Typography variant="h5" color="primary" textAlign="center" gutterBottom>📈 챌린지 참여 횟수</Typography>
        {successRates.length > 0 ? (
          <Box className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successRates} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2196f3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography align="center" color="text.secondary">챌린지 참여 이력이 없습니다.</Typography>
        )}
      </section>
    </Box>
  );
}
