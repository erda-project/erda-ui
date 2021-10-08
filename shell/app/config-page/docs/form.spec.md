# CP_FORM

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'Form'                   | false |
| operations | Obj<CP_COMMON.Operation> | false |
| props      | IProps                   | false |
| state      | IState                   | false | ,   |

### IState

| 名称     | 类型 | 必填      |
| -------- | ---- | --------- | ----- | --- |
| formData | Obj  | undefined | false | ,   |

### IProps

| 名称     | 类型                  | 必填  |
| -------- | --------------------- | ----- |
| width    | number                | true  |
| name     | string                | true  |
| title    | string                | true  |
| visible  | boolean               | true  |
| fields   | CP_COMMON.FormField[] | false |
| formData | Obj                   | true  |
| readOnly | boolean               | true  |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    props: {
      formRef?: any;
      modalProps?: Obj;
      onCancel?(): void;
      onFailed?(res?: object, isEdit?: boolean): void;
      onFieldsChange?(v: Obj): void;
      onOk?(result: object, isEdit: boolean): Promise<any> | void;
    };

} |
