# CP_PANEL

## 接口

### Field

| 名称       | 类型                | 必填      |
| ---------- | ------------------- | --------- | ---------- | ---------- | ---- |
| label      | string              | true      |
| valueKey   | any                 | true      |
| renderType | 'ellipsis'          | 'tagsRow' | 'linkText' | 'copyText' | true |
| value      | any                 | true      |
| operations | CP_COMMON.Operation | true      | ,          |

### IProps

| 名称           | 类型       | 必填         |
| -------------- | ---------- | ------------ | ---- |
| visible        | boolean    | true         |
| fields         | Field[]    | false        |
| column         | number     | true         |
| colon          | boolean    | true         |
| columnNum      | number     | true         |
| isMultiColumn  | boolean    | true         |
| layout         | 'vertical' | 'horizontal' | true |
| data           | Obj        | true         |
| type           | 'Z'        | 'N'          | true |
| numOfRowsLimit | number     | true         | ,    |

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- |
| type  | 'Panel' | false |
| props | IProps  | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
