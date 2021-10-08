# CP_INFO_PREVIEW

## 接口

### IRender

| 名称      | 类型   | 必填  |
| --------- | ------ | ----- | --- |
| type      | string | false |
| dataIndex | string | true  |
| props     | Obj    | true  | ,   |

### Spec

| 名称  | 类型          | 必填  |
| ----- | ------------- | ----- | --- |
| type  | 'InfoPreview' | false |
| props | IProps        | false |
| data  | IData         | false | ,   |

### IData

| 名称 | 类型 | 必填  |
| ---- | ---- | ----- | --- |
| info | Obj  | false | ,   |

### IProps

| 名称    | 类型      | 必填  |
| ------- | --------- | ----- |
| render  | IRender[] | false |
| visible | boolean   | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
