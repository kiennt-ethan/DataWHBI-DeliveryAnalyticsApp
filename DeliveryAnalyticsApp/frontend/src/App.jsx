import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Imports Components
import BackgroundVideo from './components/BackgroundVideo';
import Navbar from './components/Navbar';
import DashboardView from './views/DashboardView';
import PredictView from './views/PredictView';
import ChatView from './views/ChatView';

// Imports Utils
import { TRANSLATIONS } from './utils/constants';

const App = () => {
  // --- GLOBAL STATE ---
  const [lang, setLang] = useState('vi');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // Quản lý View chính
  const [currency, setCurrency] = useState('VND');

  const t = TRANSLATIONS[lang];

  // Effect: Xử lý Dark Mode class cho HTML body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#0f111a] text-gray-100' : 'bg-gray-100 text-gray-900'}`}>

      {/* 1. Nền Video */}
      <BackgroundVideo isDarkMode={isDarkMode} />

      {/* 2. Thanh Điều Hướng (Navbar) */}
      <Navbar
        activeTab={activeView}
        setActiveTab={setActiveView}
        t={t}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* 3. Khu vực Nội dung chính (Main Content) */}
      <main className="relative z-10 w-full max-w-[1400px] pt-24 pb-12 px-4 md:px-6 mx-auto">
        <AnimatePresence mode="wait">

          {activeView === 'dashboard' && (
            <DashboardView key="dashboard" isDarkMode={isDarkMode} t={t} currency={currency} />
          )}

          {activeView === 'predict' && (
            <PredictView key="predict" isDarkMode={isDarkMode} t={t} currency={currency} />
          )}

          {activeView === 'chat' && (
            <ChatView key="chat" isDarkMode={isDarkMode} t={t} />
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;