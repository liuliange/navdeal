import React from 'react';
import { AqiCategory, AIR_QUALITY_STYLES } from '@/types/weather';

interface AirQualityBadgeProps {
  aqi?: number;
  category?: string;
  className?: string;
}

export const AirQualityBadge: React.FC<AirQualityBadgeProps> = ({ aqi, category, className = '' }) => {
  if (!aqi || !category) return null;

  const styleClass = AIR_QUALITY_STYLES[category as AqiCategory] || '';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className={`px-1.5 py-0.5 rounded text-xs font-medium ${styleClass}`}
      >
        {category}
      </div>
      <span className="font-medium">{aqi}</span>
    </div>
  );
}; // Added missing semicolon
