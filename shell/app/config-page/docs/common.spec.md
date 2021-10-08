# CP_COMMON

## 接口

### Operation

| 名称        | 类型    | 必填      |
| ----------- | ------- | --------- | ---- |
| undefined   | any     | false     |
| key         | string  | false     |
| reload      | boolean | false     |
| text        | string  | true      |
| disabled    | boolean | true      |
| disabledTip | string  | true      |
| confirm     | string  | IConfirm  | true |
| command     | Command | Command[] | true |
| meta        | Obj     | true      |
| show        | boolean | true      |
| successMsg  | string  | true      |
| errorMsg    | string  | true      |
| prefixIcon  | string  | true      |
| fillMeta    | string  | true      |
| showIndex   | number  | true      | ,    |

### IConfirm

| 名称     | 类型   | 必填  |
| -------- | ------ | ----- | --- |
| title    | string | false |
| subTitle | string | false | ,   |

### Command

| 名称      | 类型    | 必填  |
| --------- | ------- | ----- | --- |
| undefined | any     | false |
| key       | string  | false |
| target    | string  | true  |
| state     | Obj     | true  |
| jumpOut   | boolean | true  | ,   |

### FormField

| 名称           | 类型                                                          | 必填   |
| -------------- | ------------------------------------------------------------- | ------ | ------ | ---- |
| label          | string                                                        | false  |
| key            | string                                                        | false  |
| component      | string                                                        | false  |
| group          | string                                                        | true   |
| labelTip       | string                                                        | true   |
| defaultValue   | Obj                                                           | number | string | true |
| initialValue   | Obj                                                           | true   |
| rules          | Obj[]                                                         | true   |
| required       | boolean                                                       | true   |
| componentProps | Obj                                                           | true   |
| removeWhen     | Array<Array<{ field: string; operator: string; value: any }>> | true   |
| disableWhen    | Array<Array<{ [prop: string]: any }>>                         | true   |

## 枚举

## 类型

| 名称 | 值  |
| ---- | --- |
