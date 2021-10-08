# CP_TEXT_GROUP

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'TextGroup'              | false |
| props      | IProps                   | false |
| operations | Obj<CP_COMMON.Operation> | true  | ,   |

### IProps

| 名称    | 类型    | 必填     |
| ------- | ------- | -------- | ---- | --- |
| value   | any     | false    |
| visible | boolean | true     |
| gapSize | string  | true     |
| align   | 'left'  | 'center' | true | ,   |

### IStatusTextItem

| 名称   | 类型      | 必填      |
| ------ | --------- | --------- | ------------ | ------- | ----- |
| text   | string    | false     |
| status | 'default' | 'success' | 'processing' | 'error' | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
