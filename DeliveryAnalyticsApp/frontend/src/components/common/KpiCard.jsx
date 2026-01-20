import React from 'react';
import GlassCard from './GlassCard';

const KpiCard = ({ title, value, unit, icon: Icon, color }) => {
    return (
        <GlassCard
            className="p-5 flex flex-col justify-between h-32 relative overflow-hidden group"
            hoverEffect={true}
        >
            {/* Background Blob Effect - Tạo điểm nhấn màu sắc mờ phía sau */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 dark:opacity-20 bg-current ${color} group-hover:scale-125 transition-transform duration-500 blur-2xl`}></div>

            {/* Header: Title & Icon */}
            <div className="flex justify-between items-start z-10">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</span>
                <div className={`p-2 rounded-xl bg-white/50 dark:bg-white/10 shadow-sm backdrop-blur-sm`}>
                    <Icon size={18} className={color.replace('bg-', 'text-')} />
                    {/* Lưu ý: Nếu prop color là 'bg-blue-500', ta cần class text tương ứng. 
                        Tốt nhất prop color nên truyền class text (vd: 'text-blue-500') 
                        hoặc xử lý logic tách biệt màu nền/màu chữ. 
                        Ở đây giả định color truyền vào là class màu text (vd: text-blue-500) */}
                </div>
            </div>

            {/* Value Area */}
            <div className="z-10 mt-auto">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white drop-shadow-sm">
                        {value}
                    </span>
                    {unit && (
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {unit}
                        </span>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

export default KpiCard;