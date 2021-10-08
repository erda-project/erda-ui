# CP_FORM_MODAL

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'FormModal'              | false |
| operations | Obj<CP_COMMON.Operation> | false |
| props      | IProps                   | false |
| state      | IState                   | false | ,   |

### IState

| 名称     | 类型    | 必填      |
| -------- | ------- | --------- | ----- |
| formData | Obj     | undefined | false |
| visible  | boolean | false     |
| title    | string  | true      | ,     |

### IProps

| 名称        | 类型                  | 必填    |
| ----------- | --------------------- | ------- | ---- |
| width       | number                | true    |
| name        | string                | true    |
| title       | string                | true    |
| visible     | boolean               | true    |
| marginStyle | 'normal'              | 'tense' | true |
| fields      | CP_COMMON.FormField[] | false   |
| formData    | Obj                   | true    |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
