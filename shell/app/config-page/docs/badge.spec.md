# CP_BADGE

## 接口

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- |
| type  | 'Badge' | false |
| props | IProps  | false |
| data  | {       |

      list: IProps[];
    } | true |,

### IProps

| 名称   | 类型    | 必填  |
| ------ | ------- | ----- |
| color  | string  | true  |
| status | Status  | false |
| withBg | boolean | false |
| text   | string  | false |
| tip    | string  | true  |

## 枚举

### Status

| 名称       | 值         |
| ---------- | ---------- |
| success    | success    |
| processing | processing |
| default    | default    |
| error      | error      |
| warning    | warning    |

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
