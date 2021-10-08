# CP_SORT_GROUP

## 接口

### Spec

| 名称       | 类型        | 必填  |
| ---------- | ----------- | ----- | --- |
| type       | 'SortGroup' | false |
| state      | Obj         | false |
| operations | Obj         | false |
| props      | IProps      | true  |
| data       | IData       | false | ,   |

### IProps

| 名称           | 类型    | 必填 |
| -------------- | ------- | ---- | --- |
| draggable      | boolean | true |
| groupDraggable | boolean | true | ,   |

### IData

| 名称  | 类型   | 必填  |
| ----- | ------ | ----- | --- |
| type  | string | false |
| value | Item[] | false | ,   |

### Operation

| 名称        | 类型    | 必填                                |
| ----------- | ------- | ----------------------------------- | ---- |
| icon        | string  | false                               |
| hoverShow   | boolean | true                                |
| hoverTip    | string  | true                                |
| key         | string  | false                               |
| reload      | boolean | false                               |
| text        | string  | true                                |
| disabled    | boolean | true                                |
| disabledTip | string  | true                                |
| confirm     | string  | { title: string; subTitle: string } | true |
| meta        | Obj     | true                                |
| show        | boolean | true                                |
| prefixIcon  | string  | true                                |
| fillMeta    | string  | true                                | ,    |

### Item

| 名称       | 类型           | 必填  |
| ---------- | -------------- | ----- |
| id         | number         | false |
| groupId    | number         | false |
| title      | string         | false |
| operations | Obj<Operation> | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
