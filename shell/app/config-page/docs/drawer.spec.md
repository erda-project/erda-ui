# CP_DRAWER

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Drawer'                 | false |
| operations | Obj<CP_COMMON.Operation> | true  |
| state      | IState                   | false |
| props      | IProps                   | false | ,   |

### IState

| 名称    | 类型    | 必填  |
| ------- | ------- | ----- | --- |
| visible | boolean | false | ,   |

### IProps

| 名称         | 类型    | 必填    |
| ------------ | ------- | ------- | -------- | ------ | ---- |
| title        | string  | true    |
| closable     | boolean | true    |
| maskClosable | boolean | true    |
| placement    | 'top'   | 'right' | 'bottom' | 'left' | true |
| size         | 's'     | 'm'     | 'l'      | 'xl'   | true |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    content: Obj;
    footer?: React.ReactNode;

} |
