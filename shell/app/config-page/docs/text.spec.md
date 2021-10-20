# CP_TEXT

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Text'                   | false |
| props      | IProps                   | false |
| operations | Obj<CP_COMMON.Operation> | true  | ,   |

### IProps

| 名称          | 类型          | 必填   |
| ------------- | ------------- | ------ | ----------- | --------- | ----- |
| renderType    | IRenderType   | false  |
| value         | ILinkTextData | string | IStatusText | ICopyText | false |
| visible       | boolean       | true   |
| styleConfig   | IStyleConfig  | true   |
| textStyleName | Obj           | true   |
| title         | string        | true   |
| titleLevel    | number        | true   | ,           |

### IStatusTextItem

| 名称   | 类型      | 必填      |
| ------ | --------- | --------- | ------------ | ------- | ----- | --- |
| text   | string    | false     |
| status | 'default' | 'success' | 'processing' | 'error' | false | ,   |

### ICopyText

| 名称     | 类型   | 必填  |
| -------- | ------ | ----- | --- |
| text     | string | false |
| copyText | string | false | ,   |

### IBgProgress

| 名称    | 类型   | 必填  |
| ------- | ------ | ----- | --- |
| text    | string | false |
| percent | number | false | ,   |

### IStyleConfig

| 名称       | 类型    | 必填  |
| ---------- | ------- | ----- | --- |
| undefined  | any     | false |
| bold       | boolean | true  |
| lineHeight | number  | true  |
| fontSize   | number  | true  | ,   |

### ILinkTextData

| 名称      | 类型              | 必填     |
| --------- | ----------------- | -------- | ----------- | ------ | ----- |
| text      | Array<ILinkTarget | string>  | ILinkTarget | string | false |
| direction | 'row'             | 'column' | true        | ,      |

### ILinkTarget

| 名称          | 类型                          | 必填  |
| ------------- | ----------------------------- | ----- |
| icon          | string                        | true  |
| iconTip       | string                        | true  |
| image         | string                        | true  |
| iconStyleName | string                        | true  |
| text          | string                        | false |
| operationKey  | string                        | false |
| styleConfig   | IStyleConfig                  | true  |
| withTag       | boolean                       | true  |
| tagStyle      | import('react').CSSProperties | true  |

## 枚举

## 类型

| 名称        | 值         |
| ----------- | ---------- | ------ | ------------ | ---------- | -------------- | -------------- | ------------ | --- | ----------- | --------------- | ----------------- | --- | ----- | --------------- |
| IRenderType | 'linkText' | 'text' | 'statusText' | 'copyText' | 'textWithIcon' | 'multipleText' | 'bgProgress' | ,   | IStatusText | IStatusTextItem | IStatusTextItem[] | ,   | Props | MakeProps<Spec> |
