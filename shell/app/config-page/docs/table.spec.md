# CP_TABLE

## 接口

### Spec
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| type | 'Table' | false |
| state | {
      total: number,
      pageNo: number,
      pageSize: number,
      selectedRowKeys?: any[],
    } | false |
| operations | Obj<CONFIG_PAGE.Operation> | false |
| data | { list: RowData[] } | false |
| props | {
      columns: Column[];
      rowKey: string,
      className?: string;
      visible?: boolean;
      rowSelection?: Record<string, any>
    } | false |,
### Column
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| title | string | false |
| dataIndex | string | false |
| titleRenderType | string | true |
| width | number | true |
| titleTip | string | string[] | true |
| data | any | true |,
### Row_Obj
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| renderType | RenderType | false |
| value | any | false |
| prefixIcon | string | true |
| operations | Obj<CONFIG_PAGE.Operation> | true |
| undefined | any | false |,
### RowData
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| undefined | string | number | Row_Obj | false |

## 枚举



## 类型

| 名称 | 值 |
| --- | --- |
| Props | MakeProps<Spec> |,| RenderType | 'textWithTags'
    | 'operationsDropdownMenu'
    | 'progress'
    | 'tableOperation'
    | 'string-list'
    | 'userAvatar'
    | 'memberSelector'
    | 'gantt'
    | 'datePicker' |
