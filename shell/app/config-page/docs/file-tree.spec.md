# CP_FILE_TREE

## 接口

### Spec

| 名称  | 类型       | 必填  |
| ----- | ---------- | ----- | --- |
| type  | 'FileTree' | false |
| data  | IData      | false |
| props | IProps     | false | ,   |

### INode

| 名称          | 类型    | 必填        |
| ------------- | ------- | ----------- | ----- |
| key           | string  | false       |
| title         | string  | JSX.Element | false |
| icon          | string  | JSX.Element | true  |
| isColorIcon   | boolean | true        |
| children      | INode[] | true        |
| selectable    | boolean | true        |
| clickToExpand | boolean | true        |
| isLeaf        | boolean | true        |
| operations    | Obj     | true        |
| \_dataType    | string  | true        | ,     |

### Field

| 名称     | 类型   | 必填 |
| -------- | ------ | ---- | --- |
| label    | string | true |
| valueKey | any    | true | ,   |

### IProps

| 名称       | 类型    | 必填 |
| ---------- | ------- | ---- | --- |
| searchable | boolean | true |
| draggable  | boolean | true |
| multiple   | boolean | true | ,   |

### IData

| 名称     | 类型    | 必填  |
| -------- | ------- | ----- |
| treeData | INode[] | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
