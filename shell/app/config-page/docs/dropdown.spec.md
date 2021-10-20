# CP_DROPDOWN

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Dropdown'               | false |
| operations | Obj<CP_COMMON.Operation> | true  |
| props      | IProps                   | false | ,   |

### IMenu

| 名称     | 类型    | 必填  |
| -------- | ------- | ----- | --- |
| key      | string  | false |
| disabled | boolean | true  |
| danger   | boolean | true  |
| title    | string  | true  |
| label    | string  | false | ,   |

### IProps

| 名称               | 类型         | 必填           |
| ------------------ | ------------ | -------------- | ------------- | ------------- | ----------- | -------------- | ---- |
| visible            | boolean      | true           |
| text               | string       | true           |
| menuProps          | Obj          | true           |
| menus              | IMenu[]      | false          |
| arrow              | boolean      | true           |
| disabled           | boolean      | true           |
| destroyPopupOnHide | boolean      | true           |
| overlayStyle       | Obj          | true           |
| placement          | 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topLeft'     | 'topCenter' | 'topRight'     | true |
| trigger            | 'click'      | 'hover'        | 'contextMenu' | Array<'click' | 'hover'     | 'contextMenu'> | true |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    children?: React.ReactElement;

} |
