# CP_TABLE

## 接口

### Spec

| 名称            | 类型                     | 必填  |
| --------------- | ------------------------ | ----- | --- |
| type            | 'Table'                  | false |
| state           | IState                   | true  |
| operations      | Obj<CP_COMMON.Operation> | true  |
| batchOperations | Obj<CP_COMMON.Operation> | true  |
| data            | IData                    | true  |
| props           | IProps                   | false | ,   |

### IData

| 名称 | 类型  | 必填  |
| ---- | ----- | ----- | --- |
| list | Obj[] | false | ,   |

### IProps

| 名称            | 类型     | 必填  |
| --------------- | -------- | ----- |
| pageSizeOptions | string[] | true  |
| columns         | Column[] | false |
| rowKey          | string   | false |
| styleNames      | Obj      | true  |
| title           | string   | true  |
| visible         | boolean  | true  |
| rowSelection    | Obj      | true  |
| selectable      | boolean  | true  |
| showHeader      | boolean  | true  |
| pagination      | boolean  | true  |
| batchOperations | string[] | true  |
| expandedProps   | {        |

      columns: Column[];
      rowKey: string;
    } | true |,

### IState

| 名称            | 类型                             | 必填  |
| --------------- | -------------------------------- | ----- | --- |
| total           | number                           | false |
| pageNo          | number                           | false |
| pageSize        | number                           | false |
| selectedRowKeys | string[]                         | true  |
| sorter          | { field: string; order: string } | true  | ,   |

### Column

| 名称            | 类型   | 必填     |
| --------------- | ------ | -------- | ---- |
| title           | string | false    |
| dataIndex       | string | false    |
| titleRenderType | string | true     |
| width           | number | true     |
| titleTip        | string | string[] | true |
| data            | any    | true     | ,    |

### Row_Obj

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- |
| undefined  | any                      | false |
| renderType | RenderType               | false |
| value      | any                      | true  |
| prefixIcon | string                   | true  |
| operations | Obj<CP_COMMON.Operation> | true  |

## 枚举

## 类型

| 名称                     | 值              |
| ------------------------ | --------------- | --- | ---------- | --- | -------------- |
| Props                    | MakeProps<Spec> | ,   | RenderType |     | 'textWithTags' |
| 'operationsDropdownMenu' |
| 'progress'               |
| 'tableOperation'         |
| 'string-list'            |
| 'userAvatar'             |
| 'memberSelector'         |
| 'gantt'                  |
| 'textWithBadge'          |
| 'textWithLevel'          |
| 'datePicker'             |
| 'linkText'               |
| 'bgProgress'             |
| 'tagsRow'                |
