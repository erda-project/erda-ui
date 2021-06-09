# CP_FORM_MODAL

## 接口

### Spec

| 名称       | 类型                           | 必填  |
| ---------- | ------------------------------ | ----- |
| type       | 'FormModal'                    | false |
| operations | CP_FORM.Spec['operations']     | false |
| props      | CP_FORM.Spec['props']          | false |
| state      | Merge<CP_FORM.Spec['state'], { |

      visible: boolean
      title?: string
    }> | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
