'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AnalogClock() {
  // Initialize with null to avoid hydration mismatch
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time only on client side
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't render clock hands until client-side time is available
  if (!time) {
    return (
      <div className="analog-clock-widget p-3 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm mx-auto w-[150px] h-[150px] flex items-center justify-center">
        <div className="clock-face relative w-[120px] h-[120px] rounded-full border border-border/40 bg-background/80 mx-auto">
          {/* Static clock face without hands */}
        </div>
      </div>
    );
  }

  // 计算指针角度
  const secondsDegrees = (time.getSeconds() / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="widget-card analog-clock-widget p-3 bg-card/80 backdrop-blur-sm mx-auto w-[150px] h-[150px] flex items-center justify-center group relative overflow-hidden"
    >
      {/* 背景装饰 - 主题感知 */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
      
      <div className="clock-face relative w-[120px] h-[120px] rounded-full border border-border/40 bg-background/80 mx-auto z-10">
        {/* 时钟刻度 - 调整为靠近边缘但不与数字重叠 */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="clock-marker absolute bg-foreground/80"
            style={{
              height: i % 3 === 0 ? '8px' : '4px', // 缩短刻度长度
              width: i % 3 === 0 ? '2px' : '1px', // 主要刻度更粗
              left: '50%',
              top: '5px', // 移到靠近边缘但留出更多空间
              transformOrigin: '50% 55px', // 调整旋转中心点
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
            }}
          />
        ))}
        
        {/* 时钟数字 - 放置在距离刻度更远的位置 */}
        {[...Array(12)].map((_, i) => {
          const number = i === 0 ? 12 : i;
          const angle = i * 30;
          const radian = (angle - 90) * (Math.PI / 180);
          const radius = 40; // 更靠近中心，避免与刻度重叠
          
          // 计算数字的位置
          const x = radius * Math.cos(radian);
          const y = radius * Math.sin(radian);
          
          return (
            <div
              key={`number-${i}`}
              className="absolute text-xs font-medium text-foreground/90"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10, // 确保数字在最上层
              }}
            >
              {number}
            </div>
          );
        })}
        
        {/* 时针 */}
        <div
          className="clock-hour-hand absolute w-1.5 h-[35px] bg-foreground rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${hoursDegrees}deg)`,
          }}
        />

        {/* 分针 */}
        <div
          className="clock-minute-hand absolute w-1 h-[45px] bg-foreground rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${minutesDegrees}deg)`,
          }}
        />

        {/* 秒针 - 缩短长度确保不超出表盘 */}
        <div
          className="clock-second-hand absolute w-0.5 h-[52px] bg-primary rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${secondsDegrees}deg)`,
          }}
        />

        {/* 中心点 */}
        <div className="clock-center absolute w-3 h-3 bg-primary rounded-full" style={{ left: 'calc(50% - 6px)', top: 'calc(50% - 6px)' }} />
      </div>
    </motion.div>
  );
}