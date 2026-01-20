import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "", hoverEffect = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`
        relative overflow-hidden rounded-3xl
        bg-gradient-to-br from-white/10 via-white/5 to-transparent
        backdrop-blur-xl
        border border-t-white/20 border-l-white/20 border-b-black/20 border-r-black/20
        shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
        ${hoverEffect ? 'hover:shadow-[0_8px_32px_0_rgba(249,115,22,0.2)] hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Hiệu ứng phản quang (Sheen effect) */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {children}
        </motion.div>
    );
};

export default GlassCard;