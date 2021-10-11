# CP_LINEAR_DISTRIBUTION

## 接口

### Spec

| 名称  | 类型                 | 必填  |
| ----- | -------------------- | ----- |
| type  | 'LinearDistribution' | false |
| props | IProps               | false |
| data  | {                    |

      list: IData[];
      total?: number;
    } | false |,

### IData

| 名称   | 类型   | 必填  |
| ------ | ------ | ----- | --- |
| value  | number | false |
| label  | string | false |
| color  | string | true  |
| tip    | string | false |
| status | string | true  | ,   |

### IProps

| 名称 | 类型    | 必填     |
| ---- | ------- | -------- | ----- | ----- |
| size | 'small' | 'normal' | 'big' | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
