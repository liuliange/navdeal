// 主题配置类型定义

// 主题样式对象类型
export interface ThemeStyles {
  // 基础颜色
  primary: string;
  'primary-foreground': string;
  background: string;
  'background-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  card: string;
  'card-foreground': string;
  border: string;
  popover: string;
  'popover-foreground': string;

  // 字体相关
  'font-family': string;
  'font-size-base': string;
  'font-size-sm': string;
  'font-size-lg': string;
  'font-weight-normal': string;
  'font-weight-medium': string;
  'font-weight-bold': string;
  'line-height': string;

  // 卡片样式
  'card-padding': string;
  'card-radius': string;
  'card-shadow': string;
  'card-hover-shadow': string;
  'card-border-width': string;
  'card-border-style': string;

  // 边框和圆角
  'border-radius-sm': string;
  'border-radius-md': string;
  'border-radius-lg': string;
  'border-width': string;
  'border-style': string;

  // 间距
  'spacing-xs': string;
  'spacing-sm': string;
  'spacing-md': string;
  'spacing-lg': string;
  'spacing-xl': string;

  // 动画和过渡
  'transition-duration': string;
  'transition-timing': string;

  // 阴影
  'shadow-sm': string;
  'shadow-md': string;
  'shadow-lg': string;
  'shadow-hover': string;
}

// 主题配置类型
export interface ThemeConfig {
  name: string;           // 主题的唯一标识符
  displayName: string;    // 显示在UI中的主题名称
  modes: string[];        // 支持的模式列表，如 ['light', 'dark']
  styles: {              // 主题样式配置
    [mode: string]: ThemeStyles;  // 每个模式对应的样式配置
  };
}