---
title: Table
nav:
  path: /components
  title: 组件
---

# Table 表格

## 基本用法

<code src="./demos/basic.tsx" />

## 行操作

<code src="./demos/row-action.tsx" />

## 排序

<code src="./demos/sort.tsx" />

## 行选择

<code src="./demos/row-selection.tsx" />

## 分页

<code src="./demos/pagination.tsx" />

## 批量操作

<code src="./demos/batch-operation.tsx" />

## 空数据页面（针对后端分页）

<code src="./demos/empty-text.tsx" />

## API

**Table**

| 参数         | 说明       | 类型                                                               | 默认值 |
| ------------ | ---------- | ------------------------------------------------------------------ | ------ |
| columns      | 列配置数组 | ErdaColumnProps[]                                                  | -      |
| actions      | 行操作数组 | { width?: number \| string; render: (record: T) => RowAction[] }[] | -      |
| rowSelection | 行选择     | TableRowSelection & { actions: RowActions[] }                      | -      |
| extraConfig  | 额外配置项 | ExtraConfig                                                        | -      |

其余参数参考[Antd Table](https://ant.design/components/table-cn/#API)

**Column**

| 参数   | 说明         | 类型    | 默认值 |
| ------ | ------------ | ------- | ------ |
| hidden | 是否隐藏此列 | boolean | false  |

其余参数参考[Antd Table Column](https://ant.design/components/table-cn/#Column)

**ExtraConfig**

| 参数             | 说明                                                                            | 类型                                       | 默认值 |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------ | ------ |
| tableKey         | Table 的全局唯一 key,如果设置，则会用于存储在 localStorage 维持刷新后的表格状态 | string                                     | -      |
| hideHeader       | 是否隐藏表格头                                                                  | boolean                                    | false  |
| hideColumnConfig | 是否隐藏列过滤器                                                                | boolean                                    | false  |
| onReload         | 刷新函数                                                                        | (pageNo: number, pageSize: number) => void | -      |
| whiteHeader      | 是否白色主题表格头                                                              | boolean                                    | false  |
| whiteFooter      | 是否白色主题表格尾                                                              | boolean                                    | false  |
