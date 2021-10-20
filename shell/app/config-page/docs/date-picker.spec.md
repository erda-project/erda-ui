# CP_DATE_PICKER

## 接口

### Spec

| 名称  | 类型         | 必填  |
| ----- | ------------ | ----- | --- |
| type  | 'DatePicker' | false |
| props | IProps       | false |
| state | IState       | false |
| cId   | string       | false | ,   |

### IState

| 名称  | 类型   | 必填     |
| ----- | ------ | -------- | ----- | --- |
| value | number | number[] | false | ,   |

### IPureDatePickerProps

| 名称               | 类型          | 必填     |
| ------------------ | ------------- | -------- | ------- | --------- | -------- | ---- |
| allowClear         | boolean       | true     |
| bordered           | boolean       | true     |
| className          | string        | true     |
| showTime           | boolean       | true     |
| disabled           | boolean       | true     |
| mode               | 'time'        | 'date'   | 'month' | 'year'    | 'decade' | true |
| picker             | 'date'        | 'week'   | 'month' | 'quarter' | 'year'   | true |
| placeholder        | string        | true     |
| size               | 'large'       | 'middle' | 'small' | true      |
| defaultPickerValue | number        | number[] | true    |
| ranges             | Obj<number[]> | true     |
| defaultValue       | number        | number[] | true    |
| format             | string        | true     | ,       |

### IProps

| 名称           | 类型        | 必填 |
| -------------- | ----------- | ---- |
| visible        | boolean     | true |
| type           | 'dateRange' | true |
| borderTime     | boolean     | true |
| disabledFuture | boolean     | true |

## 枚举

## 类型

| 名称   | 值                      |
| ------ | ----------------------- | --- | ----- | ------------------- |
| Moment | import('moment').Moment | ,   | Props | MakeProps<Spec> & { |

    extraFooter?: React.ReactElement;

} |
