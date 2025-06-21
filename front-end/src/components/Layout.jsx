import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-white"> {/* bg-gray-50 or #fffaf2 제거 */}
      <Header />
      <main className="flex-1 w-full flex flex-col pt-[64px] pb-[60px]">
        <div className="w-full max-w-5xl mx-auto flex-1 px-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}


