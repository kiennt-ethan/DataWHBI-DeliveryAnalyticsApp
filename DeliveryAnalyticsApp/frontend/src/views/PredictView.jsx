import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu, Calculator, Truck, Clock, DollarSign, Zap,
    Activity, Navigation, Package, AlertTriangle, RefreshCw, Layers, Lock, RotateCcw
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { API_BASE, CURRENCIES } from '../utils/constants';
import { formatMoney, formatNum } from '../utils/formatters';

const PredictView = ({ isDarkMode, t, currency }) => {
    const currencySymbol = CURRENCIES[currency]?.symbol || '$';

    const [inputs, setInputs] = useState({
        distance: 5000,
        amount: 100,
        weight: 2,
        traffic: 'medium',
        vehicle: 'motorbike'
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Biến cờ: Nếu có kết quả thì khóa form
    const isLocked = !!result;

    // Reset khi đổi tiền tệ
    useEffect(() => { setResult(null); }, [currency]);

    const handlePredict = async () => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1200));
            const res = await axios.post(`${API_BASE}/api/ml/predict`, inputs);
            setResult(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleReset = () => {
        setResult(null); // Xóa kết quả -> Mở khóa form
    };

    const handleRandomize = () => {
        if (isLocked) return; // Không cho random khi đang khóa
        setInputs({
            distance: Math.floor(Math.random() * 40000) + 1000,
            amount: Math.floor(Math.random() * 500) + 50,
            weight: Math.floor(Math.random() * 20) + 1,
            traffic: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            vehicle: ['motorbike', 'van'][Math.floor(Math.random() * 2)],
        });
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 py-4 font-sans h-full">

            {/* --- LEFT COLUMN: CONTROL PANEL --- */}
            <div className="col-span-1 xl:col-span-4 flex flex-col h-full">
                <GlassCard className={`p-6 md:p-8 relative overflow-hidden group border-t-4 ${isLocked ? 'border-t-gray-500' : 'border-t-orange-500'} flex-1 flex flex-col transition-colors duration-500`}>
                    {/* Decor Background */}
                    <div className="absolute top-0 right-0 p-20 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3 tracking-tight">
                            <span className={`p-2 rounded-lg text-white shadow-lg transition-colors ${isLocked ? 'bg-gray-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                                {isLocked ? <Lock size={20} /> : <Cpu size={20} />}
                            </span>
                            {t.predict.title}
                        </h2>

                        {/* Chỉ hiện nút Random khi chưa khóa */}
                        {!isLocked && (
                            <button onClick={handleRandomize} className="p-2 text-gray-400 hover:text-orange-500 transition-colors bg-gray-100 dark:bg-white/5 rounded-lg">
                                <RefreshCw size={16} />
                            </button>
                        )}
                    </div>

                    {/* Form Area - Thêm opacity khi bị khóa */}
                    <div className={`space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin transition-opacity duration-300 ${isLocked ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                        <InputSlider
                            label={t.predict.distance} value={inputs.distance}
                            max={50000} step={100} unit={t.units.m} icon={Navigation} color="orange"
                            onChange={v => setInputs({ ...inputs, distance: v })}
                            disabled={isLocked}
                        />

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign size={14} className="text-green-500" /> {t.predict.amount}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-green-600 dark:text-green-400 font-bold font-mono">{currencySymbol}</span>
                                </div>
                                <input
                                    type="number" value={inputs.amount} disabled={isLocked}
                                    onChange={e => setInputs({ ...inputs, amount: parseFloat(e.target.value) })}
                                    className="block w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-green-500/50 outline-none transition-all disabled:bg-gray-200 dark:disabled:bg-white/5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Package size={14} className="text-blue-500" /> {t.predict.weight}
                                </label>
                                <input
                                    type="number" value={inputs.weight} disabled={isLocked}
                                    onChange={e => setInputs({ ...inputs, weight: parseFloat(e.target.value) })}
                                    className="block w-full px-4 py-3 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500/50 outline-none transition-all disabled:bg-gray-200 dark:disabled:bg-white/5"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Truck size={14} className="text-purple-500" /> {t.predict.vehicle}
                                </label>
                                <div className="flex bg-gray-100 dark:bg-black/40 rounded-xl p-1 border border-gray-200 dark:border-white/10 h-[50px]">
                                    {['motorbike', 'van'].map(v => (
                                        <button
                                            key={v} disabled={isLocked}
                                            onClick={() => setInputs({ ...inputs, vehicle: v })}
                                            className={`flex-1 rounded-lg text-[10px] font-bold uppercase transition-all ${inputs.vehicle === v
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {t.predict.vehicle_opt[v]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={14} className="text-red-500" /> {t.predict.traffic}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'low', label: t.predict.traffic_opt.low, color: 'bg-emerald-500' },
                                    { id: 'medium', label: t.predict.traffic_opt.medium, color: 'bg-yellow-500' },
                                    { id: 'high', label: t.predict.traffic_opt.high, color: 'bg-red-500' }
                                ].map(type => (
                                    <button
                                        key={type.id} disabled={isLocked}
                                        onClick={() => setInputs({ ...inputs, traffic: type.id })}
                                        className={`
                            py-2.5 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1
                            ${inputs.traffic === type.id
                                                ? `border-${type.color.split('-')[1]}-500 bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-lg`
                                                : 'border-transparent bg-gray-100 dark:bg-black/40 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/5'}
                          `}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${type.color} shadow-[0_0_8px_currentColor]`}></div>
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN ACTION BUTTON --- */}
                    {/* Nút này nằm ngoài vùng disabled để luôn bấm được */}
                    <button
                        onClick={isLocked ? handleReset : handlePredict}
                        disabled={loading}
                        className={`
                    w-full py-4 mt-4 rounded-xl font-black text-sm tracking-[0.1em] uppercase shadow-xl transition-all flex justify-center items-center gap-3
                    ${isLocked
                                ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-gray-500/20'
                                : 'bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-[length:200%_auto] animate-gradient text-white shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02]'}
                `}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="animate-spin" size={18} />
                                <span className="animate-pulse">{t.predict.btn_loading}</span>
                            </>
                        ) : isLocked ? (
                            <>
                                <RotateCcw size={18} /> {t.predict.btn_reset}
                            </>
                        ) : (
                            <>
                                <Zap size={18} fill="currentColor" /> {t.predict.btn_run}
                            </>
                        )}
                    </button>
                </GlassCard>
            </div>

            {/* --- RIGHT COLUMN: RESULTS VISUALIZATION --- */}
            <div className="col-span-1 xl:col-span-8 h-full">
                <AnimatePresence mode="wait">
                    {!result ? (
                        // --- TRẠNG THÁI CHỜ (AWAITING) ---
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <GlassCard className="h-full min-h-[600px] flex flex-col items-center justify-center text-center opacity-70 border-dashed border-2 border-gray-300 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
                                <div className="relative mb-6">
                                    <div className="w-28 h-28 bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-800 dark:to-black rounded-full flex items-center justify-center shadow-inner relative z-10">
                                        <Layers size={40} className="text-gray-400 dark:text-gray-600" />
                                    </div>
                                    <div className="absolute inset-0 border border-orange-500/20 rounded-full animate-ping"></div>
                                </div>
                                {/* Dùng từ khóa Dynamic */}
                                <h3 className="text-xl font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">{t.predict.awaiting_title}</h3>
                                <p className="text-gray-400 dark:text-gray-500 mt-3 max-w-xs text-sm">
                                    {t.predict.awaiting_desc}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        // --- HIỂN THỊ KẾT QUẢ ---
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full content-start"
                        >
                            {/* RESULT 1: COST */}
                            <GlassCard className="p-6 relative overflow-hidden flex flex-col justify-between border-l-4 border-l-orange-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all h-full min-h-[220px]">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[50%] w-full animate-scan pointer-events-none"></div>

                                <div className="absolute top-0 right-0 p-4 bg-orange-500/10 rounded-bl-3xl">
                                    <DollarSign className="text-orange-500 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-2">{t.predict.result_cost}</p>
                                    <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 tracking-tighter drop-shadow-sm">
                                        {formatMoney(result.cost, currency)}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-lg w-fit border border-orange-500/20">
                                        <AlertTriangle size={12} className="text-orange-500" />
                                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                            {t.predict.label_base} + {formatMoney(result.factors.dist_impact, currency)} ({t.predict.label_dist})
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: "98.5%" }} transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 shadow-[0_0_10px_orange]"
                                        />
                                    </div>
                                </div>
                            </GlassCard>

                            {/* RESULT 2: TIME */}
                            <GlassCard className="p-6 relative overflow-hidden flex flex-col justify-between border-l-4 border-l-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all h-full min-h-[220px]">
                                <div className="absolute top-0 right-0 p-4 bg-blue-500/10 rounded-bl-3xl">
                                    <Clock className="text-blue-500 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-2">{t.predict.result_time}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 tracking-tighter drop-shadow-sm">
                                            {result.time}
                                        </span>
                                        <span className="text-lg font-bold text-gray-400">{t.units.min}</span>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg w-fit border border-blue-500/20">
                                        <Activity size={12} className="text-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                            {t.predict.label_traffic}: {result.factors.traffic_impact}
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                                            <motion.circle
                                                initial={{ strokeDasharray: "0 251" }} animate={{ strokeDasharray: `${(result.time / 120) * 251} 251` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-500"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* AI INSIGHT */}
                            <div className="col-span-1 md:col-span-2">
                                <GlassCard className="p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-[#064e3b]/40 dark:to-black/60 border-emerald-500/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                        <Zap size={18} className="fill-current" /> {t.predict.insight}
                                    </h4>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium relative z-10">
                                        {t.predict.rec_p1}
                                        <span className="px-2 py-0.5 mx-1 bg-emerald-100 dark:bg-emerald-500/20 rounded border border-emerald-500/30 font-bold text-emerald-800 dark:text-emerald-300">
                                            {t.predict.vehicle_opt[inputs.vehicle]}
                                        </span>
                                        {t.predict.rec_p2} <span className="font-bold text-gray-900 dark:text-white">{formatNum(inputs.distance / 1000)}km</span> {t.predict.rec_p3}
                                        <br className="my-2" />
                                        {result.time > 60
                                            ? <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1 mt-2"><AlertTriangle size={14} /> {t.predict.rec_warn}</span>
                                            : <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-2">✨ {t.predict.rec_good}</span>
                                        }
                                    </div>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Helper: Slider ---
const InputSlider = ({ label, value, max, step, unit, icon: Icon, onChange, color, disabled }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                <Icon size={14} className={`text-${color}-500`} /> {label}
            </label>
            <span className={`text-sm font-mono font-bold text-${color}-500 bg-${color}-500/10 px-2 py-0.5 rounded`}>
                {formatNum(value)} <span className="text-gray-400 text-xs">{unit}</span>
            </span>
        </div>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
            <motion.div layout className={`absolute top-0 left-0 h-full bg-${color}-500 rounded-full ${disabled ? 'opacity-50' : ''}`} style={{ width: `${(value / max) * 100}%` }} />
            <input
                type="range" min="0" max={max} step={step} value={value} disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-${color}-500 rounded-full shadow-md pointer-events-none transition-all ${disabled ? 'opacity-50' : ''}`} style={{ left: `${(value / max) * 100}%` }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-mono font-bold"><span>0</span><span>{max / 1000}km</span></div>
    </div>
);

export default PredictView;