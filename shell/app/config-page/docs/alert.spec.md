# CP_ALERT

## 接口

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- | --- |
| type  | 'Alert' | false |
| props | IProps  | true  | ,   |

### IProps

| 名称     | 类型      | 必填     |
| -------- | --------- | -------- | --------- | ------- | ----- |
| visible  | boolean   | true     |
| showIcon | boolean   | true     |
| type     | 'success' | 'normal' | 'warning' | 'error' | false |
| message  | string[]  | string   | false     |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
