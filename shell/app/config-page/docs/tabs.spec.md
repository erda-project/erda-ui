# CP_TABS

## 接口

### ITabMenu

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| undefined  | any                      | false |
| key        | string                   | false |
| name       | string                   | false |
| operations | Obj<CP_COMMON.Operation> | true  | ,   |

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Tabs'                   | false |
| state      | IState                   | true  |
| props      | IProps                   | false |
| operations | Obj<CP_COMMON.Operation> | true  | ,   |

### IProps

| 名称    | 类型       | 必填  |
| ------- | ---------- | ----- | --- |
| tabMenu | ITabMenu[] | false |
| visible | boolean    | true  | ,   |

### IState

| 名称      | 类型   | 必填  |
| --------- | ------ | ----- |
| activeKey | string | false |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    tabBarExtraContent?: React.ReactElement;
    children?: React.ReactElement[];

} |
