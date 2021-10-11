# CP_EDIT_LIST

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'EditList'               | false |
| operations | Obj<CP_COMMON.Operation> | false |
| state      | IState                   | false |
| props      | IProps                   | false | ,   |

### IProps

| 名称    | 类型    | 必填  |
| ------- | ------- | ----- | --- |
| visible | boolean | true  |
| temp    | Temp[]  | false | ,   |

### IState

| 名称 | 类型  | 必填  |
| ---- | ----- | ----- | --- |
| list | Obj[] | false | ,   |

### Temp

| 名称   | 类型    | 必填  |
| ------ | ------- | ----- | --- |
| title  | string  | false |
| key    | string  | false |
| width  | number  | true  |
| flex   | number  | true  |
| render | IRender | false | ,   |

### IRender

| 名称         | 类型    | 必填   |
| ------------ | ------- | ------ | -------- | ------------- | ----- |
| undefined    | any     | false  |
| type         | 'input' | 'text' | 'select' | 'inputSelect' | false |
| required     | boolean | true   |
| uniqueValue  | boolean | true   |
| defaultValue | string  | true   |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
