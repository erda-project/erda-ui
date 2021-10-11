# CP_CONTAINER

## 接口

### Spec

| 名称           | 类型        | 必填          |
| -------------- | ----------- | ------------- | -------------- | ----- |
| type           | 'Container' | 'LRContainer' | 'RowContainer' | false |
| left           | Obj         | true          |
| right          | Obj         | true          |
| props          | IProps      | true          |
| contentSetting | string      | true          | ,              |

### IProps

| 名称           | 类型      | 必填     |
| -------------- | --------- | -------- | -------- | ----- | ------- | ------ | ---- |
| visible        | boolean   | true     |
| direction      | 'column'  | 'row'    | true     |
| contentSetting | 'between' | 'center' | 'start'  | 'end' | true    |
| isTopHead      | boolean   | true     |
| spaceSize      | 'none'    | 'small'  | 'middle' | 'big' | 'large' | 'huge' | true |
| whiteBg        | boolean   | true     |
| border         | boolean   | true     |
| fullHeight     | boolean   | true     |
| flexHeight     | boolean   | true     |
| startAlign     | boolean   | true     |
| scrollAuto     | boolean   | true     |
| className      | string    | true     |

## 枚举

## 类型

| 名称  | 值                  |
| ----- | ------------------- |
| Props | MakeProps<Spec> & { |

    children?: any;
    props: {
      className: string;
      onClick?: () => void;
    };

} |
