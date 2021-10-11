# CP_TILED_FILTER

## 接口

### Spec

| 名称  | 类型          | 必填  |
| ----- | ------------- | ----- |
| type  | 'TiledFilter' | false |
| props | IProps        | false |
| state | {             |

      values: Object;
    } | false |,

### IProps

| 名称    | 类型                                                   | 必填  |
| ------- | ------------------------------------------------------ | ----- |
| fields  | Array<import('common/components/tiled-filter').IField> | false |
| delay   | number                                                 | true  |
| visible | boolean                                                | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
