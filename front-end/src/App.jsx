import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// 인증 없이 접근 가능한 컴포넌트
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import FindId from './components/FindId'
import FindPassword from './components/FindPassword'
import VerifyResetCode from './components/VerifyResetCode'
import ResetPasswordByCode from './components/ResetPasswordByCode'
import KakaoCallback from './components/KakaoCallback'
import GoogleCallback from './components/GoogleCallback'
import ConsentPage from './components/ConsentPage'

// 공통 레이아웃
import Layout from './components/Layout'

// 레이아웃 내부 페이지
import Home from './components/Home'
import ReceiptUpload from './components/ReceiptUpload'
import Ledger from './components/Ledger'
import ManualEntry from './components/ManualEntry'
import DailyLedger from './components/DailyLedger'
import MyPage from './components/MyPage'
import MyInfo from './components/MyInfo'
import ChallengePage from './components/ChallengePage'
import MyHistory from './components/MyHistory'
import NoSpendingChallenge from './components/NoSpendingChallenge'
import CategoryLimitChallenge from './components/CategoryLimitChallenge'
import SavingChallenge from './components/SavingChallenge'
import EditProfile from './components/EditProfile'
import Report from './components/Report'; 
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 인증 없이 접근 가능한 경로 */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/find-id" element={<FindId />} />
        <Route path="/find-password" element={<FindPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password-by-code" element={<ResetPasswordByCode />} />
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
        <Route path="/oauth/google/callback" element={<GoogleCallback />} />
        <Route path="/consent" element={<ConsentPage />} />

        {/* 공통 레이아웃이 적용되는 보호된 페이지들 */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/home/receipt" element={<ReceiptUpload />} />
          <Route path="/report" element={<Report />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/ledger/manual" element={<ManualEntry />} />
          <Route path="/ledger/:date" element={<DailyLedger />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/info" element={<MyInfo />} />
          <Route path="/mypage/challenges" element={<ChallengePage />} />
          <Route path="/mypage/history" element={<MyHistory />} />
          <Route path="/mypage/edit" element={<EditProfile />} />
          <Route path="/challenges/no-spending" element={<NoSpendingChallenge />} />
          <Route path="/challenges/category-limit" element={<CategoryLimitChallenge />} />
          <Route path="/challenges/saving" element={<SavingChallenge />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
