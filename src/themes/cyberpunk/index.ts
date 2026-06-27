import { type ThemeConfig } from '@/types/theme';
import './style.css';

// 赛博朋克主题配置
export const cyberpunkTheme: ThemeConfig = {
  name: 'cyberpunk',
  displayName: '赛博朋克',
  modes: ['dark'],
  styles: {
    dark: {
      // 基础颜色
      primary: 'hsl(286, 100%, 65%)', // 赛博朋克紫
      'primary-foreground': 'hsl(0, 0%, 100%)',
      background: 'hsl(232, 40%, 4%)', // 更深邃的背景
      'background-foreground': 'hsl(0, 0%, 100%)',
      muted: 'hsl(232, 35%, 12%)',
      'muted-foreground': 'hsl(232, 20%, 70%)',
      accent: 'hsl(180, 100%, 55%)', // 科技青
      'accent-foreground': 'hsl(0, 0%, 100%)',
      card: 'hsl(232, 40%, 8%)', // 卡片背景
      'card-foreground': 'hsl(0, 0%, 100%)',
      border: 'hsl(286, 100%, 65%)', // 主题色边框
      popover: 'hsl(232, 40%, 8%)',
      'popover-foreground': 'hsl(0, 0%, 100%)',
      
      // 字体相关
      'font-family': '"Rajdhani", "Orbitron", var(--font-geist-sans), system-ui, sans-serif',
      'font-size-base': '1rem',
      'font-size-sm': '0.875rem',
      'font-size-lg': '1.25rem',
      'font-weight-normal': '400',
      'font-weight-medium': '600',
      'font-weight-bold': '700',
      'line-height': '1.3',
      
      // 卡片样式
      'card-padding': '1.5rem',
      'card-radius': '0',
      'card-shadow': '0 0 20px hsla(286, 100%, 65%, 0.4), 0 0 10px hsla(180, 100%, 55%, 0.3)',
      'card-hover-shadow': '0 0 40px hsla(286, 100%, 65%, 0.7), 0 0 20px hsla(180, 100%, 55%, 0.5), 0 0 60px hsla(286, 100%, 65%, 0.3)',
      'card-border-width': '2px',
      'card-border-style': 'solid',
      
      // 边框和圆角
      'border-radius-sm': '0.125rem',
      'border-radius-md': '0.25rem',
      'border-radius-lg': '0.375rem',
      'border-width': '2px',
      'border-style': 'solid',
      
      // 间距
      'spacing-xs': '0.5rem',
      'spacing-sm': '0.75rem',
      'spacing-md': '1.25rem',
      'spacing-lg': '2rem',
      'spacing-xl': '3rem',
      
      // 动画和过渡
      'transition-duration': '150ms',
      'transition-timing': 'cubic-bezier(0.16, 1, 0.3, 1)',
      
      // 阴影
      'shadow-sm': '0 0 10px hsla(286, 100%, 65%, 0.4), 0 0 5px hsla(180, 100%, 55%, 0.2)',
      'shadow-md': '0 0 15px hsla(286, 100%, 65%, 0.5), 0 0 8px hsla(180, 100%, 55%, 0.3)',
      'shadow-lg': '0 0 25px hsla(286, 100%, 65%, 0.6), 0 0 12px hsla(180, 100%, 55%, 0.35)',
      'shadow-hover': '0 0 35px hsla(286, 100%, 65%, 0.8), 0 0 20px hsla(180, 100%, 55%, 0.5), 0 0 60px hsla(286, 100%, 65%, 0.4)'
    }
  }
};