# CP_SORT_GROUP

## 接口

### Spec
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| type | 'SortGroup' | false |
| state | Obj | false |
| operations | Obj | false |
| data | {
      type: string,
      value: Item[],
    } | false |,
### Operation
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| icon | string | false |
| key | string | false |
| disabled | boolean | true |
| disabledTip | string | true |
| onClick | void | false |,
### Item
| 名称 | 类型 | 必填 |
| --- | --- | --- |
| id | number | false |
| groupId | number | false |
| title | string | false |
| operations | Operation[] | true |

## 枚举



## 类型

| 名称 | 值 |
| --- | --- |
| Props | MakeProps<Spec> |
