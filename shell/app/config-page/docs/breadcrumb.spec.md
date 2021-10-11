# CP_BREADCRUMB

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Breadcrumb'             | false |
| operations | Obj<CP_COMMON.Operation> | false |
| data       | IData                    | false |
| props      | IProps                   | true  | ,   |

### IData

| 名称 | 类型              | 必填  |
| ---- | ----------------- | ----- | --- |
| list | IBreadcrumbData[] | false | ,   |

### IBreadcrumbData

| 名称      | 类型    | 必填  |
| --------- | ------- | ----- | --- |
| key       | string  | false |
| item      | string  | false |
| activeKey | string  | true  |
| menus     | IMenu[] | true  | ,   |

### IMenu

| 名称 | 类型   | 必填  |
| ---- | ------ | ----- | --- |
| key  | string | false |
| item | string | false | ,   |

### IProps

| 名称      | 类型    | 必填 |
| --------- | ------- | ---- |
| visible   | boolean | true |
| separator | string  | true |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
