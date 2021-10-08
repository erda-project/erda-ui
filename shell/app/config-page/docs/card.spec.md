# CP_CARD

## 接口

### Spec

| 名称  | 类型   | 必填  |
| ----- | ------ | ----- | --- |
| type  | 'Card' | false |
| props | IProps | false | ,   |

### IProps

| 名称     | 类型          | 必填  |
| -------- | ------------- | ----- | --- |
| data     | Obj<InfoData> | false |
| cardType | string        | false | ,   |

### InfoData

| 名称        | 类型                     | 必填            |
| ----------- | ------------------------ | --------------- | ---- |
| id          | string                   | false           |
| titleIcon   | string                   | React.ReactNode | true |
| title       | string                   | React.ReactNode | true |
| operations  | Obj<CP_COMMON.Operation> | true            |
| subContent  | string                   | React.ReactNode | true |
| description | string                   | React.ReactNode | true |
| extraInfo   | Obj                      | true            |
| type        | string                   | false           |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    className: string;

} |
