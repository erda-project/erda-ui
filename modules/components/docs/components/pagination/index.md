---
title: Pagination
nav:
  path: /components
  title: 组件
---

# Pagination

> 分页组件

此为完全受控组件

## 基本用法

<code src="./demos/basic.tsx" />

## API

| 参数                | 说明                                                     | 类型                     | 默认值 |
| ------------------- | -------------------------------------------------------- | ------------------------ | ------ |
| total               | 数据总条数                                               | number                   | -      |
| current             | 当前页码                                                 | number                   | -      |
| pageSize            | 单页条数                                                 | number                   | 10     |
| onChange            | 页码或 pageSize 改变的回调，参数是改变后的页码及每页条数 | function(page, pageSize) | -      |
| hidePageSizeChanger | 是否隐藏 pageSize 切换器                                 | boolean                  | false  |
| hideTotal           | 是否隐藏总条数                                           | boolean                  | false  |
