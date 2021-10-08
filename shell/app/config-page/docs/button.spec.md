# CP_BUTTON

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Button'                 | false |
| operations | Obj<CP_COMMON.Operation> | true  |
| props      | IProps                   | true  | ,   |

### IProps

| 名称        | 类型       | 必填  |
| ----------- | ---------- | ----- | --- |
| text        | string     | false |
| type        | any        | true  |
| disabled    | boolean    | true  |
| disabledTip | string     | true  |
| ghost       | boolean    | true  |
| menu        | MenuItem[] | true  |
| prefixIcon  | string     | true  |
| style       | Obj        | true  |
| suffixIcon  | string     | true  |
| tooltip     | string     | true  |
| tipProps    | Obj        | true  |
| visible     | boolean    | true  | ,   |

### MenuItem

| 名称        | 类型                     | 必填  |
| ----------- | ------------------------ | ----- |
| key         | string                   | false |
| text        | string                   | false |
| disabled    | boolean                  | true  |
| disabledTip | string                   | true  |
| prefixIcon  | string                   | true  |
| confirm     | string                   | true  |
| operations  | Obj<CP_COMMON.Operation> | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
