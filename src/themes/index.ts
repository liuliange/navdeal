import './theme.css'
import { simpleTheme } from './simple';


export interface Theme {
  name: string
  displayName: string
  mode: 'light' | 'dark'
}

export const themes: Theme[] = [
  {
    name: 'simple-light',
    displayName: '简约浅色',
    mode: 'light'
  },
  {
    name: 'simple-dark',
    displayName: '简约深色',
    mode: 'dark'
  },
  {
    name: 'cyberpunk-dark',
    displayName: '赛博朋克',
    mode: 'dark'
  }
]

export function getAllThemes(): Theme[] {
  return themes
}

export function getThemeMode(themeName: string): 'light' | 'dark' {
  const theme = themes.find(t => t.name === themeName)
  return theme?.mode || 'light'
}

// 应用主题样式
export function applyTheme(themeName: string) {
  // 确保主题名称有效
  if (!themes.find(t => t.name === themeName)) {
    themeName = 'simple-light'
  }

  document.documentElement.setAttribute('data-theme', themeName)
  // 保存到 localStorage
  localStorage.setItem('theme', themeName)
  // 触发主题变化事件
  window.dispatchEvent(new Event('themeChange'))
}

export { simpleTheme } from './simple';
export { cyberpunkTheme } from './cyberpunk';

export const defaultTheme = simpleTheme;