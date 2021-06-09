# CP_RADIO

## 接口

### Spec

| 名称                 | 类型      | 必填  |
| -------------------- | --------- | ----- |
| type                 | 'Radio'   | false |
| props                | {         |
| buttonStyle: 'solid' | 'outline' |

      disabled?: boolean,
      disabledTip?: string,
      options?: Option[],
      radioType?: string,
      size?: 'small' | 'default' | 'large',
    } | false |

| state | {
childrenValue: Obj,
value: string,
} | false |
| operations | {
onChange: CONFIG_PAGE.Operation
} | false |,

### Option

| 名称       | 类型                                 | 必填  |
| ---------- | ------------------------------------ | ----- |
| key        | string                               | false |
| text       | string                               | false |
| children   | Array<{ key: string, text: string }> | true  |
| prefixIcon | string                               | true  |
| suffixIcon | string                               | true  |
| tooltip    | string                               | true  |
| width      | string                               | true  |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
