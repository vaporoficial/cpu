
import React, { useState, useEffect, useRef } from 'react';

interface FloatingBubbleProps {
  onClick: () => void;
  isActive: boolean;
  remainingSeconds?: number;
  totalSeconds?: number;
}

const FloatingBubble: React.FC<FloatingBubbleProps> = ({ onClick, isActive, remainingSeconds = 0, totalSeconds = 1 }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 85, y: window.innerHeight - 180 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isActive ? (remainingSeconds / totalSeconds) * 100 : 0;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      let newX = clientX - dragStart.current.x;
      let newY = clientY - dragStart.current.y;

      newX = Math.max(0, Math.min(newX, window.innerWidth - 75));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 75));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const isCritical = isActive && remainingSeconds <= 10;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
        zIndex: 9999,
        touchAction: 'none'
      }}
      className={`w-[72px] h-[72px] rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] border-2 border-cyan-400/50 backdrop-blur-xl transition-transform ${isDragging ? 'scale-110' : 'scale-100'} ${isActive ? 'bg-[#0c4a6e]/90' : 'bg-[#020617]/90'}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onClick={() => !isDragging && onClick()}
    >
      <div className={`relative flex items-center justify-center w-full h-full ${isCritical ? 'animate-pulse' : ''}`}>
        {isActive ? (
          <>
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="rgba(6,182,212,0.1)"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke={isCritical ? "#f87171" : "#22d3ee"}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s linear' }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
              />
            </svg>
            <div className="flex flex-col items-center z-10">
               <span className="text-white font-black text-[15px] leading-none mb-0.5 tracking-tighter">
                {formatTime(remainingSeconds)}
               </span>
               <span className="text-[6px] text-cyan-400 font-black uppercase tracking-tighter">Active</span>
            </div>
          </>
        ) : (
          <svg className="w-9 h-9 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      
      {/* Badge de Ativo Neon */}
      {!isActive && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full border-2 border-[#020617] flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default FloatingBubble;
