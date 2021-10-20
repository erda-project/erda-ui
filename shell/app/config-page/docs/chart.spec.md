# CP_CHART

## 接口

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- | --- |
| type  | 'Chart' | false |
| props | IProps  | false |
| cId   | string  | false | ,   |

### IProps

| 名称       | 类型    | 必填  |
| ---------- | ------- | ----- | ----- | ----- |
| chartType  | 'line'  | 'pie' | 'bar' | false |
| option     | Obj     | false |
| style      | Obj     | false |
| visible    | boolean | true  |
| title      | string  | false |
| isLoadMore | boolean | true  |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    extraContent?: React.ReactElement;

} |
