# CP_EMPTY_HOLDER

## 接口

### Spec

| 名称  | 类型          | 必填  |
| ----- | ------------- | ----- | --- |
| type  | 'EmptyHolder' | false |
| props | IProps        | true  | ,   |

### IProps

| 名称      | 类型        | 必填 |
| --------- | ----------- | ---- | ---- |
| tip       | string      | true |
| icon      | string      | true |
| relative  | boolean     | true |
| style     | object      | true |
| action    | JSX.Element | null | true |
| className | string      | true |
| visible   | boolean     | true |
| whiteBg   | boolean     | true |
| paddingY  | boolean     | true |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
