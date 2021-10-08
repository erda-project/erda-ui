# CP_LIST

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'List'                   | false |
| operations | Obj<CP_COMMON.Operation> | true  |
| props      | IProps                   | true  |
| data       | IData                    | false |
| state      | IState                   | true  | ,   |

### IState

| 名称     | 类型   | 必填 |
| -------- | ------ | ---- | --- |
| pageNo   | number | true |
| pageSize | number | true |
| total    | number | true | ,   |

### IProps

| 名称            | 类型     | 必填 |
| --------------- | -------- | ---- | --- |
| rowKey          | string   | true |
| visible         | boolean  | true |
| size            | ISize    | true |
| isLoadMore      | boolean  | true |
| alignCenter     | boolean  | true |
| noBorder        | boolean  | true |
| pageSizeOptions | string[] | true | ,   |

### IData

| 名称 | 类型        | 必填  |
| ---- | ----------- | ----- | --- |
| list | IListData[] | false | ,   |

### IListData

| 名称        | 类型                     | 必填            |
| ----------- | ------------------------ | --------------- | ---- |
| undefined   | any                      | false           |
| id          | string                   | number          | true |
| title       | string                   | false           |
| description | string                   | true            |
| prefixImg   | string                   | React.ReactNode | true |
| extraInfos  | IIconInfo[]              | true            |
| operations  | Obj<CP_COMMON.Operation> | true            | ,    |

### IIconInfo

| 名称       | 类型                     | 必填            |
| ---------- | ------------------------ | --------------- | --------- | ------- | ---- |
| icon       | string                   | React.ReactNode | true      |
| text       | string                   | false           |
| type       | 'success'                | 'normal'        | 'warning' | 'error' | true |
| tooltip    | string                   | true            |
| operations | Obj<CP_COMMON.Operation> | true            |

## 枚举

## 类型

| 名称  | 值       |
| ----- | -------- | ------- | ------- | --- | ----- | --------------- |
| ISize | 'middle' | 'large' | 'small' | ,   | Props | MakeProps<Spec> |
