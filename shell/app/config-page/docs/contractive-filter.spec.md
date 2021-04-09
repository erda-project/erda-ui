# CP_FILTER

## 接口

### Spec
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| type | 'ContractiveFilter' | false |
| props | {
      delay?: number
    } | false |
| operations | Obj<CONFIG_PAGE.Operation> | false |
| state | {
      values: Obj,
      conditions: Condition[]
    } | false |,
### Condition
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| key | string | false |
| label | string | false |
| type | ConditionType | false |
| emptyText | string | true |
| value | string | number | string[] | number[] | Obj | true |
| fixed | boolean | true |
| showIndex | number | true |
| haveFilter | boolean | true |
| placeholder | string | true |
| quickSelect | {
      label: string,
      operationKey: string,
    } | true |
| options | Array<{
      label: string
      value: string | number
      icon?: string
    }> | true |

## 枚举



## 类型

| 名称 | 值 |
| --- | --- |
| Props | MakeProps<Spec> |,| ConditionType | 'select' | 'input' | 'dateRange' |
