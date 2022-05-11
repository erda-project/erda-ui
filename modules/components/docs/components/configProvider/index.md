---
title: ConfigProvider
order: 7
nav:
  path: /components
  title: 组件
---

# ConfigProvider

> 全局配置上下文

## 基本用法

<code src="./demos/basic.tsx" />

## API

| 参数      | 说明                                                                                        | 类型   | 默认值 |
| --------- | ------------------------------------------------------------------------------------------- | ------ | ------ |
| locale    | 语言包配置，语言包可到 @erda-ui/components/es/locale 目录下寻找，也可以添加自己的自定义语言 | object | -      |
| clsPrefix | 设置统一样式前缀。注意：需要配合 less 变量 @erda-prefix 使用                                | string | erda   |
