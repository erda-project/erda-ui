---
title: FormModal
nav:
  path: /components
  title: 组件
---

## Form Modal

> 表单弹窗

### 基本用法

<code src="./demos/basic.tsx" />

### 编辑表单

<code src="./demos/edit.tsx" />

### 精确标题

<code src="./demos/exact-title.tsx" />

## API

| 参数       | 说明                                                                          | 类型      | 默认值 |
| ---------- | ----------------------------------------------------------------------------- | --------- | ------ |
| isEditing  | 是否编辑状态                                                                  | boolean   | false  |
| exactTitle | 是否使用精确标题，为 false 时，弹窗标题会根据状态自动添加`新建`或`编辑`的前缀 | boolean   | false  |
| formProps  | 表单属性                                                                      | FormProps | -      |
| loading    | 是否加载中                                                                    | boolean   | false  |

其余参数参考 [Antd Modal](https://ant.design/components/modal-cn/#API)
