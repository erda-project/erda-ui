# CP_FILTER

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'ContractiveFilter'      | false |
| props      | IProps                   | true  |
| operations | Obj<CP_COMMON.Operation> | false |
| state      | IState                   | false | ,   |

### IState

| 名称       | 类型        | 必填  |
| ---------- | ----------- | ----- | --- |
| values     | Obj         | false |
| conditions | Condition[] | false | ,   |

### IProps

| 名称      | 类型    | 必填 |
| --------- | ------- | ---- | --- |
| delay     | number  | true |
| visible   | boolean | true |
| fullWidth | boolean | true | ,   |

### Condition

| 名称        | 类型          | 必填   |
| ----------- | ------------- | ------ | ------ | -------- | -------- | ---- |
| key         | string        | false  |
| label       | string        | false  |
| type        | ConditionType | false  |
| emptyText   | string        | true   |
| value       | Obj           | string | number | string[] | number[] | true |
| fixed       | boolean       | true   |
| showIndex   | number        | true   |
| haveFilter  | boolean       | true   |
| placeholder | string        | true   |
| quickSelect | IQuickSelect  | true   |
| options     | IOption[]     | true   | ,      |

### IOption

| 名称  | 类型   | 必填   |
| ----- | ------ | ------ | ----- |
| label | string | false  |
| value | string | number | false |
| icon  | string | true   | ,     |

### IQuickSelect

| 名称         | 类型   | 必填  |
| ------------ | ------ | ----- |
| label        | string | false |
| operationKey | string | false |

## 枚举

## 类型

| 名称          | 值       |
| ------------- | -------- | ------- | ----------- | --- | ----- | --------------- |
| ConditionType | 'select' | 'input' | 'dateRange' | ,   | Props | MakeProps<Spec> |
