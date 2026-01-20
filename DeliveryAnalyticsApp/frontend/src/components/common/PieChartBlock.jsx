import React from 'react';
import GlassCard from './GlassCard'; // Sử dụng lại GlassCard để đồng bộ thiết kế

const PieChartBlock = ({ title, data, mainColor, mainText }) => (
    <GlassCard className="flex-1 p-6 flex flex-col justify-center h-full min-h-[250px] hover:border-white/20 transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-6 text-gray-500 dark:text-gray-400 text-center border-b border-gray-200 dark:border-white/5 pb-3">
            {title}
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Vòng tròn tỷ lệ chính */}
            <div className={`relative w-28 h-28 rounded-full border-[8px] flex items-center justify-center ${mainColor} shadow-lg dark:shadow-none`}>
                <span className={`text-xl font-black ${mainText} drop-shadow-sm`}>
                    {data[0]?.value}%
                </span>
            </div>

            {/* Danh sách chú thích */}
            <div className="text-xs space-y-3 w-full sm:w-auto">
                {data.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between sm:justify-start gap-3 w-full">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${s.color} shadow-sm`}></div>
                            <span className="font-medium text-gray-600 dark:text-gray-300">{s.name}</span>
                        </div>
                        {/* Hiển thị giá trị nhỏ bên cạnh nếu cần */}
                        {i > 0 && <span className="font-bold text-gray-400 dark:text-gray-500">{s.value}%</span>}
                    </div>
                ))}
            </div>
        </div>
    </GlassCard>
);

export default PieChartBlock;