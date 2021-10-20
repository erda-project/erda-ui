# CP_DROPDOWN_SELECT

## 接口

### Spec

| 名称  | 类型             | 必填  |
| ----- | ---------------- | ----- | --- |
| type  | 'DropdownSelect' | false |
| props | IProps           | false |
| state | IState           | false | ,   |

### IProps

| 名称        | 类型           | 必填    |
| ----------- | -------------- | ------- | -------------- | ---- | --- |
| quickSelect | IQuickSelect[] | true    |
| visible     | boolean        | true    |
| showLimit   | number         | false   |
| overlay     | any            | true    |
| options     | IOptionItem[]  | true    |
| trigger     | Array<'click'  | 'hover' | 'contextMenu'> | true | ,   |

### IState

| 名称  | 类型   | 必填  |
| ----- | ------ | ----- | --- |
| value | string | false |
| label | string | false | ,   |

### IOptionItem

| 名称         | 类型                     | 必填  |
| ------------ | ------------------------ | ----- | --- |
| label        | string                   | false |
| value        | string                   | false |
| operations   | Obj<CP_COMMON.Operation> | false |
| prefixImgSrc | string                   | true  |
| prefixIcon   | string                   | true  |
| suffixIcon   | string                   | true  |
| disabled     | boolean                  | true  | ,   |

### IQuickSelect

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- |
| label      | string                   | false |
| value      | string                   | false |
| operations | Obj<CP_COMMON.Operation> | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
