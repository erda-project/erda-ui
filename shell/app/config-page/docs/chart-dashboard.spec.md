# CP_CHART_DASHBOARD

## 接口

### Spec

| 名称  | 类型             | 必填  |
| ----- | ---------------- | ----- | --- |
| type  | 'ChartDashboard' | false |
| props | IProps           | false |
| state | IState           | false |
| cId   | string           | false | ,   |

### IState

| 名称           | 类型 | 必填  |
| -------------- | ---- | ----- | --- |
| globalVariable | Obj  | false | ,   |

### IProps

| 名称   | 类型                                                          | 必填  |
| ------ | ------------------------------------------------------------- | ----- |
| layout | import('@erda-ui/dashboard-configurator/dist').default.Layout | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
