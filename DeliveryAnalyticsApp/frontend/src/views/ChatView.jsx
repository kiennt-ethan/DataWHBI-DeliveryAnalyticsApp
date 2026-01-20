import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, Sparkles, User, RefreshCw, Zap, MessageSquare,
    Mic, Paperclip, ThumbsUp, ThumbsDown, Copy, Download,
    FileText, Check, MoreVertical
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { API_BASE } from '../utils/constants';

const ChatView = ({ isDarkMode, t }) => {
    // --- STATE ---
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'bot',
            text: t.chat.welcome,
            isTyping: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false); // Giả lập Voice
    const endRef = useRef(null);

    // --- HANDLERS ---
    const handleSend = async (questionText) => {
        const q = questionText || input;
        if (!q.trim()) return;

        // 1. Add User Message
        const newMessageId = Date.now();
        const userMsg = {
            id: newMessageId,
            role: 'user',
            text: q,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // GIẢ LẬP DELAY SUY NGHĨ (1.5s - 2s) để tạo cảm giác AI đang xử lý
            await new Promise(r => setTimeout(r, 1500));

            const res = await axios.post(`${API_BASE}/api/chat/ask`, { question: q });

            // 2. Add Bot Message (Kích hoạt Typewriter mượt mà)
            setMessages(prev => [...prev, {
                id: newMessageId + 1,
                role: 'bot',
                text: res.data.answer,
                isTyping: true, // Kích hoạt hiệu ứng gõ
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sources: ['Data Warehouse', 'Logistics Report Q3'] // Giả lập nguồn
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'bot',
                text: t.common.error,
                isTyping: false
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleTypingComplete = (id) => {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isTyping: false } : msg));
    };

    // Giả lập tính năng Voice
    const toggleVoice = () => {
        setIsListening(!isListening);
        if (!isListening) {
            setTimeout(() => {
                setIsListening(false);
                setInput("Phân tích doanh thu tháng này giúp tôi");
            }, 5000);
        }
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto h-[85vh] flex flex-col font-sans group">

            {/* BACKGROUND EFFECTS */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* MAIN CONTAINER */}
            <div className={`
                flex-1 flex flex-col overflow-hidden rounded-[24px]
                bg-white/60 dark:bg-[#0f111a]/80
                backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl
                relative
            `}>

                {/* 1. HEADER (TOOLBAR) */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Bot size={20} className="text-white" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#0f111a]"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-base tracking-wide">
                                Logistics AI Assistant
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">ONLINE</span>
                                <span>• v4.2 Stable</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 transition-colors" title="Export Chat">
                            <Download size={18} />
                        </button>
                        <button
                            onClick={() => setMessages([{ id: Date.now(), role: 'bot', text: t.chat.welcome, isTyping: false }])}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                            title="New Chat"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. CHAT HISTORY */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {messages.map((msg, i) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            onTypingComplete={handleTypingComplete}
                        />
                    ))}

                    {/* THINKING INDICATOR */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 ml-2"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-100 to-white dark:from-[#1e293b] dark:to-[#0f111a] border border-white/10 flex items-center justify-center shadow-sm">
                                <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-3 bg-white/50 dark:bg-white/5 rounded-2xl rounded-tl-sm border border-white/20">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium animate-pulse">AI đang phân tích dữ liệu...</span>
                                <div className="flex gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={endRef} />
                </div>

                {/* 3. INPUT AREA */}
                <div className="p-5 bg-white/60 dark:bg-[#0b0f19]/60 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/5 relative z-30">

                    {/* Quick Prompts */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide mask-fade-sides">
                        {t.chat.prompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(prompt)}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
                            >
                                <Zap size={10} className="fill-current text-yellow-500" /> {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-end gap-2 bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-white/10 rounded-2xl p-2 shadow-lg transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50">

                        <button type="button" className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Upload File">
                            <Paperclip size={20} />
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={isListening ? "Đang nghe..." : t.chat.placeholder}
                            className="flex-1 bg-transparent border-none text-gray-800 dark:text-white px-2 py-3 text-sm font-medium outline-none placeholder:text-gray-400 max-h-32 overflow-y-auto"
                            disabled={loading}
                        />

                        {/* Voice Button (Simulated) */}
                        <button
                            type="button"
                            onClick={toggleVoice}
                            className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            <Mic size={20} />
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !input}
                            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                        >
                            <Send size={18} fill="currentColor" />
                        </button>
                    </form>

                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-400 dark:text-gray-600">AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ==========================================================================================
   COMPONENTS CON: MESSAGE BUBBLE & TYPEWRITER
   ========================================================================================== */

const MessageBubble = ({ message, onTypingComplete }) => {
    const isBot = message.role === 'bot';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${!isBot ? 'flex-row-reverse' : ''} group`}
        >
            {/* AVATAR */}
            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-md mt-1 border 
                ${isBot
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-500'
                }`}>
                {isBot ? <Sparkles size={16} /> : <User size={16} />}
            </div>

            {/* CONTENT */}
            <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${!isBot ? 'items-end' : 'items-start'}`}>

                {/* Name & Time */}
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {isBot ? 'Logistics AI' : 'You'}
                    </span>
                    <span className="text-[9px] text-gray-400">{message.timestamp}</span>
                </div>

                {/* BUBBLE */}
                <div className={`relative px-5 py-4 text-[14px] leading-relaxed shadow-lg backdrop-blur-md 
                    ${!isBot
                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-[18px] rounded-tr-sm shadow-indigo-500/20'
                        : 'bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 rounded-[18px] rounded-tl-sm'
                    }`}>

                    {isBot && message.isTyping ? (
                        <Typewriter text={message.text} onComplete={() => onTypingComplete(message.id)} />
                    ) : (
                        <FormattedText text={message.text} isBot={isBot} />
                    )}
                </div>

                {/* ACTIONS & SOURCES (Only for Bot) */}
                {isBot && !message.isTyping && (
                    <div className="flex flex-col gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button onClick={handleCopy} className="text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px]">
                                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button className="text-gray-400 hover:text-green-500 transition-colors"><ThumbsUp size={12} /></button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><ThumbsDown size={12} /></button>
                        </div>

                        {/* Sources (Simulated) */}
                        {message.sources && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Sources:</span>
                                {message.sources.map((src, idx) => (
                                    <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md text-[9px] text-gray-500 dark:text-gray-400">
                                        <FileText size={8} /> {src}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// --- LOGIC GÕ CHỮ MƯỢT MÀ (Không bị lỗi lặp) ---
const Typewriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        let mounted = true;
        // Sử dụng đệ quy setTimeout để kiểm soát tốc độ tốt hơn setInterval
        const type = () => {
            if (!mounted) return;
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1)); // Lấy chuỗi con an toàn
                i++;
                let delay = 15; // Tốc độ cơ bản nhanh
                // Ngắt nghỉ tự nhiên
                if (['.', '!', '?'].includes(text.charAt(i - 1))) delay = 400;
                else if ([',', ';'].includes(text.charAt(i - 1))) delay = 150;

                setTimeout(type, delay);
            } else {
                onComplete && onComplete();
            }
        };
        type();
        return () => { mounted = false; };
    }, [text]);

    return <FormattedText text={displayedText} isBot={true} />;
};

// --- FORMAT TEXT CAO CẤP ---
const FormattedText = ({ text, isBot }) => (
    <div className="markdown-body">
        {text.split('\n').map((line, idx) => (
            <p key={idx} className={`min-h-[1.4em] ${line.trim() === '' ? 'h-2' : 'mb-1'}`}>
                {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        // Highlight số liệu quan trọng
                        return (
                            <span key={j} className={`font-bold px-1 rounded mx-0.5 ${isBot
                                ? 'text-indigo-600 dark:text-yellow-400 bg-indigo-50 dark:bg-yellow-400/10'
                                : 'text-white underline decoration-wavy decoration-white/30'
                                }`}>
                                {part.slice(2, -2)}
                            </span>
                        );
                    }
                    return part;
                })}
            </p>
        ))}
    </div>
);

export default ChatView;