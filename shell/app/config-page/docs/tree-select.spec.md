# CP_TREE_SELECT

## 接口

### INode

| 名称       | 类型    | 必填  |
| ---------- | ------- | ----- | --- |
| key        | string  | false |
| id         | string  | false |
| pId        | string  | false |
| title      | string  | false |
| isLeaf     | boolean | false |
| value      | string  | false |
| selectable | boolean | false |
| disabled   | boolean | true  | ,   |

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'TreeSelect'             | false |
| data       | IData                    | false |
| state      | IState                   | true  |
| props      | IProps                   | true  |
| operations | Obj<CP_COMMON.Operation> | true  | ,   |

### IProps

| 名称        | 类型    | 必填 |
| ----------- | ------- | ---- | --- |
| visible     | boolean | true |
| placeholder | string  | true |
| title       | string  | true | ,   |

### IState

| 名称  | 类型   | 必填                             |
| ----- | ------ | -------------------------------- | ---- | --- |
| value | string | { value: string; label: string } | true | ,   |

### IData

| 名称     | 类型    | 必填  |
| -------- | ------- | ----- |
| treeData | INode[] | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
