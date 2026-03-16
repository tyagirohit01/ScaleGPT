import React from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Chatbox from './components/Chatbox'
import Community from './pages/Community'
import Login from './pages/Login'
import Pricing from './pages/Pricing'
import { Toaster } from 'react-hot-toast'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/community" element={<Community />} />
        <Route path="/pricing"   element={<Pricing />} />
        <Route path="/admin"     element={<AdminDashboard />} />
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </>
  )
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#06060e] relative">

      {/* Ambient orbs */}
      <div className="absolute rounded-full pointer-events-none z-0 hidden md:block" style={{
        width: 560, height: 560, top: -200, left: -80,
        background: "radial-gradient(circle,rgba(123,94,167,0.13) 0%,transparent 70%)",
      }}/>
      <div className="absolute rounded-full pointer-events-none z-0 hidden md:block" style={{
        width: 380, height: 380, bottom: -80, right: 200,
        background: "radial-gradient(circle,rgba(34,211,165,0.07) 0%,transparent 70%)",
      }}/>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 md:z-10
        h-full
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `} style={{ width: 242, minWidth: 242, flexShrink: 0 }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 relative z-10 overflow-hidden flex flex-col">
        <Chatbox onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  )
}

export default App