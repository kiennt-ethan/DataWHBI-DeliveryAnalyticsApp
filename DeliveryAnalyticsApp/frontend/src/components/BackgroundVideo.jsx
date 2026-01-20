import React from 'react';
import videoBg from '../assets/background.mp4';

const BackgroundVideo = ({ isDarkMode }) => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Video Nền */}
            <video
                autoPlay loop muted playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isDarkMode ? 'opacity-30' : 'opacity-20'}`}
            >
                <source src={videoBg} type="video/mp4" />
            </video>

            {/* Lớp phủ Gradient tạo chiều sâu (Vignette) */}
            <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-[#050505] via-[#0a0a0a]/80 to-[#000000]' : 'from-gray-200 via-white/80 to-white'}`}></div>

            {/* Đốm sáng trang trí (Ambient Light) */}
            {isDarkMode && (
                <>
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                </>
            )}
        </div>
    );
};

export default BackgroundVideo;