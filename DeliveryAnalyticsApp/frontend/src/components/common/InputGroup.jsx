import React from 'react';

const InputGroup = ({ label, unit, children }) => (
    <div className="w-full">
        <div className="flex justify-between mb-2 px-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {label}
            </label>
            {unit && <span className="text-[10px] font-mono font-bold text-orange-500">{unit}</span>}
        </div>
        <div className="rounded-xl px-4 border transition-all duration-300
            bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-orange-500 focus-within:shadow-sm
            dark:bg-[#1a1f2e] dark:border-white/10 dark:focus-within:border-orange-500/50 dark:focus-within:bg-black/40
        ">
            {children}
        </div>
    </div>
);

export default InputGroup;