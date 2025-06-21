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
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-brown-800 mb-4">가계로그</h1>
      <img src={icon} alt="아이콘" className="w-28 mb-6" />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <form onSubmit={handleLogin} className="w-full max-w-xl space-y-4">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-brown-400"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-brown-400"
        />

        <button
          type="submit"
          className="w-full bg-[#5D3A00] text-white py-3 rounded-md shadow hover:bg-[#4b2e00]"
        >
          로그인
        </button>

        <div className="flex items-center justify-center text-sm text-gray-500">또는</div>

        <button
          type="button"
          onClick={() => (window.location.href = KAKAO_AUTH_URL)}
          className="w-full bg-[#FEE500] text-black font-semibold py-3 rounded-md hover:bg-[#fada00]"
        >
          카카오로 로그인
        </button>

        <button
          type="button"
          onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-md border hover:bg-gray-200"
        >
          구글로 로그인
        </button>

        <div className="flex justify-between text-sm text-gray-600">
          <Link to="/find-id" className="hover:underline">아이디 찾기</Link>
          <Link to="/find-password" className="hover:underline">비밀번호 찾기</Link>
        </div>

        <p className="text-sm text-center text-gray-700">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-green-600 hover:underline">회원가입</Link>
        </p>
      </form>
    </div>
  );
}
