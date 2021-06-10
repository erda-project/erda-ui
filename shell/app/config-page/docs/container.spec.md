# CP_CONTAINER

## 接口

### Spec

| 名称                           | 类型                          | 必填          |
| ------------------------------ | ----------------------------- | ------------- | ---------------------------------- | ----- |
| type                           | 'Container'                   | 'LRContainer' | 'RowContainer'                     | false |
| left                           | any                           | true          |
| right                          | any                           | true          |
| children                       | any                           | true          |
| props                          | {                             |
| direction?: 'column'           | 'row'; // 对应 flex-direction |
| contentSetting?: 'row-between' | 'row-center'                  | 'row-start'   | 'row-end'; // 对应 justify-content |

      className?: string;
      isTopHead?: boolean;
      whiteBg?: boolean;
      fullHeight?: boolean;
      flexHeight?: boolean;
    } | true |

## 枚举

## 类型

| 名称  | 值              |
| ----- | --------------- |
| Props | MakeProps<Spec> |
