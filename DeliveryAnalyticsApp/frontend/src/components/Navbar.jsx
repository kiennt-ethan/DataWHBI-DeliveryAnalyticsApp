import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, LayoutDashboard, BrainCircuit, MessageSquareText,
    Globe, Sun, Moon, ChevronDown, Check
} from 'lucide-react';
import { CURRENCIES } from '../utils/constants';

const Navbar = ({
    activeTab, setActiveTab,
    t,
    isDarkMode, setIsDarkMode,
    lang, setLang,
    currency, setCurrency
}) => {
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

    const MAIN_TABS = [
        { id: 'dashboard', label: t.nav.dashboard || 'Tổng Quan', icon: LayoutDashboard },
        { id: 'predict', label: t.nav.predict || 'Dự Báo AI', icon: BrainCircuit },
        { id: 'chat', label: t.nav.chat || 'Trợ Lý Ảo', icon: MessageSquareText },
    ];

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <div className="pointer-events-auto relative flex items-center justify-between gap-4 p-2 rounded-full 
                bg-white/90 border-gray-200 text-gray-800 shadow-xl
                dark:bg-[#0f111a]/80 dark:border-white/10 dark:text-white
                backdrop-blur-xl border transition-all duration-500 min-w-[320px] md:min-w-[700px]
            ">

                {/* --- LOGO --- */}
                <div className="flex items-center gap-3 pl-2 pr-4 border-r border-gray-200 dark:border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Truck className="text-white" size={18} strokeWidth={2.5} />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-sm font-black tracking-widest leading-none text-gray-900 dark:text-white">LOGISTICS</h1>
                        <span className="text-[9px] font-bold text-orange-500 tracking-[0.2em]">INTELLIGENCE</span>
                    </div>
                </div>

                {/* --- MAIN NAVIGATION (CENTER) --- */}
                <div className="flex flex-1 items-center justify-center gap-1">
                    {MAIN_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold transition-colors z-10 
                                    ${isActive
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 rounded-full shadow-inner
                                            bg-gray-100 border border-gray-200
                                            dark:bg-white/10 dark:border-white/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <tab.icon size={16} className={isActive ? "text-orange-500 dark:text-orange-400" : ""} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* --- ACTIONS (RIGHT) --- */}
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-white/10">

                    {/* 1. CURRENCY DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <span>{currency}</span>
                            <ChevronDown size={12} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isCurrencyOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-32 rounded-xl shadow-2xl overflow-hidden py-1 z-50
                                        bg-white border border-gray-100 
                                        dark:bg-[#1a1f2e] dark:border-white/10
                                    "
                                >
                                    {Object.keys(CURRENCIES).map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => { setCurrency(c); setIsCurrencyOpen(false); }}
                                            className="w-full px-4 py-2 text-left text-xs flex justify-between items-center group
                                                hover:bg-gray-50 dark:hover:bg-white/5
                                            "
                                        >
                                            <span className={currency === c
                                                ? 'text-orange-600 dark:text-orange-400 font-bold'
                                                : 'text-gray-700 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}
                                            >
                                                {c} ({CURRENCIES[c].symbol})
                                            </span>
                                            {currency === c && <Check size={12} className="text-orange-500" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. LANGUAGE TOGGLE */}
                    <button
                        onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                            text-gray-500 hover:text-gray-900 hover:bg-gray-100
                            dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                        title="Đổi ngôn ngữ"
                    >
                        <span className="text-[10px] font-black uppercase">{lang}</span>
                    </button>

                    {/* 3. THEME TOGGLE */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors border shadow-sm
                            bg-gray-50 border-gray-200 hover:bg-gray-100
                            dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10"
                    >
                        {isDarkMode ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-blue-500" />}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Navbar;