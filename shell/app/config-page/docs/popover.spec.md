# CP_POPOVER

## 接口

### IProps

| 名称          | 类型    | 必填   |
| ------------- | ------- | ------ | --- | ----- |
| size          | 's'     | 'm'    | 'l' | false |
| visible       | boolean | true   |
| title         | string  | true   |
| placement     |         | 'left' |
| 'right'       |
| 'top'         |
| 'bottom'      |
| 'topLeft'     |
| 'topRight'    |
| 'bottomLeft'  |
| 'bottomRight' |
| 'leftTop'     |
| 'leftBottom'  |
| 'rightTop'    |
| 'rightBottom' | true    | ,      |

### Spec

| 名称  | 类型      | 必填  |
| ----- | --------- | ----- |
| type  | 'Popover' | false |
| props | IProps    | false |

## 枚举

## 类型

| 名称                       | 值                  |
| -------------------------- | ------------------- |
| Props                      | MakeProps<Spec> & { |
| children?: React.ReactNode | string;             |

    content?: React.ReactNode;

} |
