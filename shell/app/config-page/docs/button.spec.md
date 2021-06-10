# CP_BUTTON

## 接口

### Spec

| 名称       | 类型     | 必填  |
| ---------- | -------- | ----- |
| type       | 'Button' | false |
| operations | {        |

      click: CONFIG_PAGE.Operation
    } | true |

| props | {
text: string;
type?: any;
ghost?: boolean;
menu?: MenuItem[];
prefixIcon?: string;
suffixIcon?: string;
tooltip?: string;
visible?: boolean;
} | true |,

### MenuItem

| 名称        | 类型                       | 必填  |
| ----------- | -------------------------- | ----- |
| key         | string                     | false |
| text        | string                     | false |
| disabled    | boolean                    | true  |
| disabledTip | string                     | true  |
| prefixIcon  | string                     | true  |
| operations  | Obj<CONFIG_PAGE.Operation> | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
