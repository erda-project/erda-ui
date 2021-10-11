# CP_IMAGE

## 接口

### Spec

| 名称  | 类型    | 必填  |
| ----- | ------- | ----- | --- |
| type  | 'Image' | false |
| props | IProps  | true  | ,   |

### IProps

| 名称     | 类型           | 必填     |
| -------- | -------------- | -------- | ----- | ------- | ---- |
| alt      | string         | true     |
| src      | string         | true     |
| isCircle | boolean        | true     |
| size     | 'small'        | 'normal' | 'big' | 'large' | true |
| visible  | boolean        | true     |
| type     | string         | true     |
| display  | 'inline-block' | 'block'  | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
