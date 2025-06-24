import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import icon from '../assets/icon.png';

export default function SignupForm() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const handleSendCode = async () => {
    if (!email) return setError('이메일을 입력해주세요.');
    try {
      const res = await fetch('/user/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setError('');
        setTimeLeft(300);
        setTimerActive(true);
      } else {
        setError(result.message || '이메일 전송 실패');
      }
    } catch {
      setError('서버 오류 발생');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch('/user/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: authCode }),
      });
      const result = await res.json();
      if (result.verified) {
        setIsEmailVerified(true);
        setError('');
        setTimerActive(false);
      } else {
        setError(result.message || '인증코드가 일치하지 않습니다.');
      }
    } catch {
      setError('네트워크 오류 발생');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!userName || !email || !password || !confirmPassword) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (!isEmailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const res = await fetch('/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, password }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        localStorage.setItem('accessToken', result.token);
        localStorage.setItem('email', result.user.email);
        localStorage.setItem('userName', result.user.userName);
        navigate('/home');
      } else {
        setError(result.message || '회원가입 실패');
      }
    } catch {
      setError('네트워크 오류 발생');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-10 flex flex-col items-center">
      <div className="flex flex-col items-center mb-6">
        <img src={icon} alt="앱 아이콘" className="w-20 mb-3" />
        <h1 className="text-2xl font-bold text-gray-800">회원가입</h1>
      </div>

      {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSignup} className="w-full max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEmailVerified}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {!isEmailVerified && (
          <>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={timerActive}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
              >
                인증코드 발송
              </button>
              {timerActive && (
                <span className="text-sm text-gray-500">
                  ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="인증코드 입력"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                className="px-4 py-3 border border-indigo-500 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition"
              >
                확인
              </button>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
