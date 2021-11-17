# CP_MARKDOWN_EDITOR

## 接口

### IProps

| 名称        | 类型    | 必填   |
| ----------- | ------- | ------ | ---- |
| visible     | boolean | true   |
| placeholder | string  | true   |
| maxLength   | number  | true   |
| defaultMode | 'md'    | 'html' | true |
| readOnly    | boolean | true   |
| autoFocus   | boolean | true   | ,    |

### IState

| 名称  | 类型   | 必填 |
| ----- | ------ | ---- | --- |
| value | string | true | ,   |

### Spec

| 名称  | 类型             | 必填  |
| ----- | ---------------- | ----- |
| type  | 'MarkdownEditor' | false |
| props | IProps           | false |
| state | IState           | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
