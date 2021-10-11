# CP_TITLE

## 接口

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- | --- |
| type  | 'Title' | false |
| props | IProps  | false | ,   |

### IProps

| 名称           | 类型    | 必填     |
| -------------- | ------- | -------- | ----- | ------- | ---- |
| title          | string  | false    |
| level          | number  | true     |
| tips           | string  | true     |
| prefixIcon     | string  | true     |
| prefixImg      | string  | true     |
| size           | 'small' | 'normal' | 'big' | 'large' | true |
| showDivider    | boolean | true     |
| showSubtitle   | boolean | true     |
| subtitle       | string  | true     |
| isCircle       | boolean | true     |
| visible        | boolean | true     |
| noMarginBottom | boolean | true     |
| operations     | Obj[]   | true     |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
