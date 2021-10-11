# CP_TAGS

## 接口

### ILabel

| 名称  | 类型   | 必填  |
| ----- | ------ | ----- | --- |
| label | string | false |
| group | string | true  |
| color | string | true  | ,   |

### IProps

| 名称      | 类型       | 必填      |
| --------- | ---------- | --------- | ----- |
| visible   | boolean    | true      |
| showCount | number     | true      |
| size      | 'small'    | 'default' | false |
| onAdd     | () => void | true      | ,     |

### Spec

| 名称             | 类型                | 必填  |
| ---------------- | ------------------- | ----- |
| type             | 'Tags'              | false |
| props            | IProps              | false |
| data             | {                   |
| labels: ILabel[] | ILabel;             |
| }                | false               |
| operations       | CP_COMMON.Operation | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
