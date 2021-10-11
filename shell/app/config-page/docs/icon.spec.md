# CP_ICON

## 接口

### Spec

| 名称  | 类型   | 必填  |
| ----- | ------ | ----- | --- |
| type  | 'Icon' | false |
| props | IProps | false | ,   |

### IProps

| 名称           | 类型           | 必填     |
| -------------- | -------------- | -------- | ---- |
| iconType       | IIconType      | false    |
| visible        | boolean        | true     |
| size           | number         | string   | true |
| strokeWidth    | number         | true     |
| strokeLinecap  | StrokeLinecap  | true     |
| strokeLinejoin | StrokeLinejoin | true     |
| theme          | Theme          | true     |
| fill           | string         | string[] | true |

## 枚举

## 类型

| 名称                  | 值  |
| --------------------- | --- | -------------- | ------- | ------- | ------- | --- | ------------- | ------ | ------- | -------- | --- | ----- | --------- | -------- | ---------- | ------------- | --- | ----- | --------------- |
| IIconType             |     | 'lock'         |
| 'unlock'              |
| 'time'                |
| 'application-one'     |
| 'user'                |
| 'link-cloud-sucess'   |
| 'link-cloud-faild'    |
| 'category-management' |
| 'list-numbers'        |
| 'api-app'             | ,   | StrokeLinejoin | 'miter' | 'round' | 'bevel' | ,   | StrokeLinecap | 'butt' | 'round' | 'square' | ,   | Theme | 'outline' | 'filled' | 'two-tone' | 'multi-color' | ,   | Props | MakeProps<Spec> |
