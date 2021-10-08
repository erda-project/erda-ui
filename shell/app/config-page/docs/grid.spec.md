# CP_GRID

## 接口

### Spec

| 名称  | 类型   | 必填  |
| ----- | ------ | ----- | --- |
| type  | 'Grid' | false |
| props | IProps | false | ,   |

### IProps

| 名称    | 类型     | 必填     |
| ------- | -------- | -------- | -------- | -------------- | --------------- | ---- |
| gutter  | number   | true     |
| align   | 'top'    | 'middle' | 'bottom' | true           |
| justify | 'start'  | 'end'    | 'center' | 'space-around' | 'space-between' | true |
| wrap    | boolean  | true     |
| span    | number[] | false    |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    children: React.ReactElement[];

} |
