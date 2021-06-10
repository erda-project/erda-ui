# CP_TABS

## 接口

### ITabMenu

| 名称      | 类型   | 必填  |
| --------- | ------ | ----- | --- |
| key       | string | false |
| name      | string | false |
| undefined | any    | false | ,   |

### Spec

| 名称  | 类型 | 必填 |
| ----- | ---- | ---- |
| state | {    |

      activeKey: string;
    } | true |

| props | {
tabMenu: ITabMenu[];
} | false |
| children | Obj<React.ReactElement> | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
