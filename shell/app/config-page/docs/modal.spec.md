# CP_MODAL

## 接口

### IProps

| 名称         | 类型    | 必填      |
| ------------ | ------- | --------- | --------- | -------- | ---- | --- |
| title        | string  | true      |
| content      | string  | true      |
| cancelText   | string  | true      |
| okText       | string  | true      |
| closable     | boolean | true      |
| mask         | boolean | true      |
| maskClosable | boolean | true      |
| size         | 'small' | 'default' | 'big'     | 'large'  | true |
| status       | 'info'  | 'warning' | 'success' | 'danger' | true | ,   |

### IState

| 名称    | 类型    | 必填  |
| ------- | ------- | ----- | --- |
| visible | boolean | false | ,   |

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- |
| type  | 'Modal' | false |
| props | IProps  | false |
| state | IState  | false |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    footer?: React.ReactElement[];
    children?: React.ReactElement[];

} |
