# CP_INPUT_SELECT

## 接口

### IOption

| 名称     | 类型      | 必填  |
| -------- | --------- | ----- | --- |
| value    | string    | false |
| label    | string    | false |
| disabled | boolean   | true  |
| children | IOption[] | true  | ,   |

### IProps

| 名称    | 类型      | 必填  |
| ------- | --------- | ----- | --- |
| options | IOption[] | false |
| visible | boolean   | false | ,   |

### Spec

| 名称  | 类型          | 必填  |
| ----- | ------------- | ----- | --- |
| type  | 'InputSelect' | false |
| state | IState        | false |
| props | IProps        | false | ,   |

### IState

| 名称  | 类型   | 必填  |
| ----- | ------ | ----- |
| value | string | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
