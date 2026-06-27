# 自定义主题指南

## 概述

本项目支持通过编程方式自定义主题，开发者可以创建自己的主题文件并注册到系统中。用户只需在Notion中配置主题选择开关即可切换不同的主题。

## 主题文件结构

每个主题文件应该导出一个符合`ThemeConfig`接口的对象，包含以下结构：

```typescript
export const myTheme: ThemeConfig = {
  name: 'my-theme',        // 主题的唯一标识符
  displayName: '我的主题',  // 显示在UI中的主题名称
  modes: ['light', 'dark'], // 支持的模式
  styles: {
    light: { /* 浅色模式样式 */ },
    dark: { /* 深色模式样式 */ }
  }
};
```

## 创建自定义主题

1. 在`src/themes`目录下创建一个新的TypeScript文件或目录，例如`my-theme.ts`或`my-theme/index.ts`
2. 参考现有主题文件（如`simple/index.ts`或`cyberpunk/index.ts`）的结构
3. 定义并导出你的主题配置对象

## 注册主题

在`src/themes/index.ts`文件中导入并注册你的主题：

```typescript
import { myTheme } from './my-theme';

// 添加到themes对象中
export const themes: Record<string, ThemeConfig> = {
  simple: simpleTheme,
  cyberpunk: cyberpunkTheme,
  'my-theme': myTheme,  // 添加你的主题
};
```

或者，你也可以使用`registerTheme`函数动态注册主题：

```typescript
import { registerTheme } from '@/themes';
import { myTheme } from './my-theme';

registerTheme(myTheme);
```

## 样式属性说明

主题样式对象包含多个类别的CSS变量，用于控制整个应用的外观：

- **基础颜色**：定义主要颜色、背景、前景、强调色等
- **字体相关**：字体族、字号、字重、行高等
- **卡片样式**：卡片内边距、圆角、阴影等
- **边框和圆角**：各种元素的边框样式和圆角大小
- **间距**：不同尺寸的间距值
- **动画和过渡**：过渡时间和缓动函数
- **阴影**：不同级别的阴影效果

详细的属性列表可以参考`src/types/theme.ts`中的`ThemeStyles`接口定义。

## 主题模式

每个主题可以支持多种模式，最常见的是`light`（浅色）和`dark`（深色）模式。在`modes`数组中定义支持的模式，并在`styles`对象中为每种模式提供对应的样式配置。

用户可以通过主题切换器选择特定主题的特定模式，例如`simple-light`（简约浅色）或`cyberpunk-dark`（赛博朋克深色）。

## 示例

可以参考`src/themes/cyberpunk/index.ts`作为创建个性化主题的示例。该主题定义了独特的颜色方案、字体和视觉效果。

## 注意事项

- 确保为每个主题提供完整的样式属性，避免缺失导致样式异常
- 测试主题在不同模式（浅色/深色）下的表现
- 主题名称必须唯一，避免与现有主题冲突
- 如果主题需要特殊的CSS样式，可以创建一个目录结构并包含样式文件，参考`cyberpunk`主题的实现