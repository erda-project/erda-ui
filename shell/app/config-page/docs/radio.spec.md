# CP_RADIO

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Radio'                  | false |
| props      | IProps                   | false |
| state      | IState                   | false |
| operations | Obj<CP_COMMON.Operation> | true  | ,   |

### IState

| 名称          | 类型   | 必填  |
| ------------- | ------ | ----- | --- |
| childrenValue | Obj    | true  |
| value         | string | false | ,   |

### IProps

| 名称        | 类型     | 必填      |
| ----------- | -------- | --------- | ------- | ---- | --- |
| buttonStyle | 'solid'  | 'outline' | true    |
| disabled    | boolean  | true      |
| disabledTip | string   | true      |
| options     | Option[] | true      |
| radioType   | string   | true      |
| size        | 'small'  | 'default' | 'large' | true | ,   |

### Option

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| key        | string                   | false |
| text       | string                   | false |
| children   | IOptionChildren[]        | true  |
| operations | Obj<CP_COMMON.Operation> | true  |
| prefixIcon | string                   | true  |
| suffixIcon | string                   | true  |
| tooltip    | string                   | true  |
| width      | string                   | true  | ,   |

### IOptionChildren

| 名称 | 类型   | 必填  |
| ---- | ------ | ----- |
| key  | string | false |
| text | string | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
