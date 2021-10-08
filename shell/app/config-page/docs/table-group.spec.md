# CP_TABLE_GROUP

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'TableGroup'             | false |
| state      | IState                   | true  |
| operations | Obj<CP_COMMON.Operation> | true  |
| data       | IData                    | true  |
| props      | IProps                   | false | ,   |

### IData

| 名称 | 类型    | 必填  |
| ---- | ------- | ----- | --- |
| list | IItem[] | false | ,   |

### IItem

| 名称        | 类型            | 必填  |
| ----------- | --------------- | ----- | --- |
| title       | CP_TEXT.Props   | false |
| subtitle    | CP_TITLE.IProps | false |
| description | CP_TEXT.IProps  | false |
| table       | CP_TABLE.Props  | false |
| extraInfo   | CP_TEXT.Props   | false | ,   |

### IProps

| 名称    | 类型    | 必填  |
| ------- | ------- | ----- | --- |
| visible | boolean | false | ,   |

### IState

| 名称     | 类型   | 必填  |
| -------- | ------ | ----- | --- |
| total    | number | false |
| pageNo   | number | false |
| pageSize | number | false | ,   |

### ITableBoardProps

| 名称  | 类型  | 必填  |
| ----- | ----- | ----- |
| props | IItem | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
