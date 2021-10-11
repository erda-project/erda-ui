# CP_API_EDITOR

## 接口

### Spec

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| type       | 'APIEditor'              | false |
| props      | IProps                   | false |
| state      | IState                   | false |
| data       | IData                    | false |
| operations | Obj<CP_COMMON.Operation> | false | ,   |

### IAssert

| 名称                | 类型                   | 必填  |
| ------------------- | ---------------------- | ----- | --- |
| comparisonOperators | IComparisonOperators[] | false | ,   |

### IComparisonOperators

| 名称       | 类型    | 必填  |
| ---------- | ------- | ----- | --- |
| label      | string  | false |
| value      | string  | false |
| allowEmpty | boolean | false | ,   |

### IBody

| 名称 | 类型        | 必填  |
| ---- | ----------- | ----- | --- |
| form | ICommonAttr | false | ,   |

### ICommonAttr

| 名称      | 类型    | 必填  |
| --------- | ------- | ----- | --- |
| showTitle | boolean | false | ,   |

### ICommonTemp

| 名称   | 类型     | 必填  |
| ------ | -------- | ----- | --- |
| target | string[] | false |
| temp   | Obj[]    | false | ,   |

### IApiExecute

| 名称      | 类型              | 必填  |
| --------- | ----------------- | ----- | --- |
| text      | string            | false |
| type      | string            | false |
| allowSave | boolean           | false |
| disabled  | boolean           | false |
| menu      | IApiExecuteMenu[] | false | ,   |

### IApiExecuteMenu

| 名称       | 类型                     | 必填  |
| ---------- | ------------------------ | ----- | --- |
| text       | string                   | false |
| key        | string                   | false |
| operations | Obj<CP_COMMON.Operation> | false | ,   |

### IProps

| 名称          | 类型                                                | 必填  |
| ------------- | --------------------------------------------------- | ----- | --- |
| showSave      | boolean                                             | false |
| index         | string                                              | false |
| visible       | boolean                                             | true  |
| executingMap  | Obj                                                 | false |
| asserts       | IAssert                                             | false |
| body          | IBody                                               | false |
| commonTemp    | ICommonTemp                                         | false |
| headers       | ICommonAttr                                         | false |
| methodList    | string[]                                            | false |
| params        | ICommonTemp                                         | false |
| apiExecute    | IApiExecute                                         | false |
| loopFormField | Array<import('app/configForm/form/form').FormField> | false | ,   |

### IState

| 名称        | 类型              | 必填  |
| ----------- | ----------------- | ----- | --- |
| attemptTest | IStateAttemptTest | false |
| data        | IStateData        | false | ,   |

### IStateData

| 名称      | 类型   | 必填  |
| --------- | ------ | ----- | --- |
| apiSpecId | number | true  |
| stepId    | number | false |
| apiSpec   | API    | false |
| loop      | ILoop  | true  | ,   |

### ILoop

| 名称     | 类型   | 必填 |
| -------- | ------ | ---- |
| break    | string | true |
| strategy | {      |

      max_times: number;
      decline_ratio: number;
      decline_limit_sec: number;
      interval_sec: number;
    } | true |,

### IStateAttemptTest

| 名称   | 类型             | 必填     |
| ------ | ---------------- | -------- | ----- |
| status | 'Passed'         | 'Failed' | false |
| data   | IAttemptTestData | false    | ,     |

### IAttemptTestData

| 名称     | 类型              | 必填 |
| -------- | ----------------- | ---- | --- |
| asserts  | ITestDataAsserts  | true |
| response | ITestDataResponse | true |
| request  | ITestDataRequest  | true | ,   |

### ITestDataAsserts

| 名称    | 类型             | 必填  |
| ------- | ---------------- | ----- | --- |
| success | boolean          | false |
| result  | IAssertsResult[] | false | ,   |

### IAssertsResult

| 名称        | 类型    | 必填  |
| ----------- | ------- | ----- | --- |
| arg         | string  | false |
| operator    | string  | false |
| value       | string  | false |
| success     | boolean | false |
| actualValue | string  | false |
| errorInfo   | string  | false | ,   |

### ITestDataResponse

| 名称    | 类型   | 必填   |
| ------- | ------ | ------ | ----- | --- |
| status  | number | false  |
| headers | Obj    | false  |
| body    | Obj    | string | false | ,   |

### ITestDataRequest

| 名称    | 类型     | 必填  |
| ------- | -------- | ----- | --- |
| method  | string   | false |
| url     | string   | false |
| params  | Obj      | false |
| headers | Obj      | false |
| body    | IApiBody | false | ,   |

### IData

| 名称          | 类型         | 必填  |
| ------------- | ------------ | ----- | --- |
| marketApiList | IMarketApi[] | false | ,   |

### IMarketApi

| 名称        | 类型   | 必填  |
| ----------- | ------ | ----- | --- |
| id          | number | false |
| path        | string | false |
| description | string | false |
| version     | string | false |
| method      | string | false |
| url         | string | false | ,   |

### API

| 名称       | 类型       | 必填  |
| ---------- | ---------- | ----- | --- |
| headers    | Row[]      | false |
| method     | string     | false |
| url        | string     | false |
| name       | string     | false |
| params     | Row[]      | false |
| body       | IApiBody   | false |
| out_params | OutParam[] | false |
| asserts    | Assert[]   | false | ,   |

### IApiBody

| 名称    | 类型   | 必填  |
| ------- | ------ | ----- | ----- | --- |
| type    | string | false |
| content | string | Obj   | false | ,   |

### Row

| 名称  | 类型   | 必填   |
| ----- | ------ | ------ | ----- |
| key   | string | false  |
| value | string | number | false |
| desc  | string | false  | ,     |

### OutParam

| 名称       | 类型   | 必填  |
| ---------- | ------ | ----- | --- |
| key        | string | false |
| source     | string | false |
| expression | string | false |
| matchIndex | string | true  | ,   |

### Assert

| 名称     | 类型   | 必填  |
| -------- | ------ | ----- |
| arg      | string | false |
| operator | string | false |
| value    | string | false |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
