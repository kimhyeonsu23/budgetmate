import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icon from '../assets/icon.png';
import { KAKAO_AUTH_URL, GOOGLE_AUTH_URL } from '../config';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorRes = await res.json().catch(() => ({}));
        const message = errorRes.message || '로그인에 실패했습니다.';
        setError(message);
        return;
      }

      const { userId, token, userName } = await res.json();
      localStorage.setItem('accessToken', token);
      localStorage.setItem('email', email);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      navigate('/home');
    } catch {
      setError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-10 flex flex-col items-center">
      <img src={icon} alt="앱 아이콘" className="w-24 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Budgetmate</h1>

      {error && <p className="text-center text-sm text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleLogin} className="w-full max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          로그인
        </button>

        <div className="text-sm text-center text-gray-500">또는</div>

        <button
          type="button"
          onClick={() => (window.location.href = KAKAO_AUTH_URL)}
          className="w-full bg-[#FEE500] text-black font-semibold py-3 rounded-xl hover:bg-[#fada00] transition"
        >
          카카오로 로그인
        </button>

        <button
          type="button"
          onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
          className="w-full bg-gray-100 text-gray-700 border border-gray-300 py-3 rounded-xl hover:bg-gray-200 transition"
        >
          구글로 로그인
        </button>

        <div className="flex justify-between text-sm text-gray-600">
          <Link to="/find-id" className="hover:underline">아이디 찾기</Link>
          <Link to="/find-password" className="hover:underline">비밀번호 찾기</Link>
        </div>

        <p className="text-sm text-center text-gray-700">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-indigo-600 font-medium hover:underline">회원가입</Link>
        </p>
      </form>
    </div>
  );
}
