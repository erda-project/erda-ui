# CP_DRAWER

## 接口

### Spec

| 名称       | 类型                       | 必填  |
| ---------- | -------------------------- | ----- |
| type       | 'Drawer'                   | false |
| operations | Obj<CONFIG_PAGE.Operation> | false |
| props      | {                          |

      visible: boolean,
      title: string,
      content: any,
      closable?: boolean,
      maskClosable?: boolean,
      placement?: 'top' | 'right' | 'bottom' | 'left',
      size?: 's' | 'm' | 'l' | 'xl', // s:256, m: 560, l: 800, xl: 1100
    } | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
