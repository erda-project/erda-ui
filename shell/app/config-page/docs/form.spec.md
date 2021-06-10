# CP_FORM

## 接口

### Spec

| 名称       | 类型   | 必填  |
| ---------- | ------ | ----- |
| type       | 'Form' | false |
| operations | {      |

      submit?: CONFIG_PAGE.Operation
    } | false |

| props | {
width?: number
name?: string;
title?: string;
fields: any[];
formData?: object;
formRef?: any;
modalProps?: object;
onCancel?(): void;
onFailed?(res?: object, isEdit?: boolean): void;
onFieldsChange?(v: Obj): void
onOk?(result: object, isEdit: boolean): Promise<any> | void;
} | false |
| state | {
formData: undefined,
} | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
