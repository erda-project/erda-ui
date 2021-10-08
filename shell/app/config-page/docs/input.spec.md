# CP_INPUT

## 接口

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- | --- |
| type  | 'Input' | false |
| props | IProps  | false |
| state | IState  | false | ,   |

### IState

| 名称  | 类型   | 必填 |
| ----- | ------ | ---- | --- |
| value | string | true | ,   |

### IProps

| 名称        | 类型    | 必填 |
| ----------- | ------- | ---- |
| disabled    | boolean | true |
| placeholder | string  | true |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
