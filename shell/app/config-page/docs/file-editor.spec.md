# CP_FILE_EDITOR

## 接口

### Spec

| 名称  | 类型         | 必填  |
| ----- | ------------ | ----- |
| type  | 'FileEditor' | false |
| props | IProps       | false |
| state | {            |

      value: string;
    } | false |

| operations | CP_COMMON.Operation | true |,

### IProps

| 名称          | 类型         | 必填           |
| ------------- | ------------ | -------------- | ---- |
| style         | Obj          | true           |
| bordered      | boolean      | true           |
| fileValidate  | FileValidate | FileValidate[] | true |
| fileExtension | string       | true           |
| minLines      | number       | true           |
| maxLines      | number       | true           |
| readOnly      | boolean      | true           |
| actions       | {            |

      copy?: boolean;
      format?: boolean;
    } | true |

## 枚举

## 类型

| 名称         | 值     |
| ------------ | ------ | ------ | ----------- | --- | ----- | --------------- |
| FileValidate | 'yaml' | 'json' | 'not-empty' | ,   | Props | MakeProps<Spec> |
