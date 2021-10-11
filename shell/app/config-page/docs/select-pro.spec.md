# CP_SELECT_PRO

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'SelectPro'              | false |
| operations | Obj<CP_COMMON.Operation> | false |
| props      | IProps                   | false |
| data       | IData                    | false |
| state      | IState                   | true  | ,   |

### IData

| 名称 | 类型  | 必填  |
| ---- | ----- | ----- | --- |
| list | Obj[] | false | ,   |

### IState

| 名称  | 类型   | 必填 |
| ----- | ------ | ---- | --- |
| value | string | true | ,   |

### IProps

| 名称            | 类型    | 必填  |
| --------------- | ------- | ----- |
| renderType      | string  | false |
| showSearch      | boolean | false |
| optionLabelProp | string  | true  |
| placeholder     | string  | true  |
| allowClear      | boolean | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
