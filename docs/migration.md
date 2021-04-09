# 迁移TypeScript记录

## 1. 添加`tsconfig.json`, 项目中已经添加

## 2. 添加需要的库的types依赖到`devDependencies`中，例如：
```json
  "@types/antd": "^1.0.0",
  "@types/classnames": "^2.2.6",
  "@types/dva": "^1.1.0",
  "@types/echarts": "^4.1.3",
  "@types/js-cookie": "^2.2.0",
  "@types/lodash": "^4.14.118",
  "@types/moment": "^2.13.0",
  "@types/react": "^16.7.13",
  "@types/react-dom": "^16.0.11",
  "@types/react-router": "^4.4.1",
  "@types/react-router-redux": "^5.0.17",
  "@types/webpack": "^4.4.20",
  ...
```

## 3. 开始重构文件
参考[官方文档](https://www.tslang.cn/docs/handbook/basic-types.html)

### 3.1 修改引入方式
babel和ts的默认行为不同，所有直接`import from`的库改为`import * from`：
```jsx
// before: import React from 'react';
import * as React from 'react';
```

### 3.2 添加props和state类型声明接口
常用类型如下(注意每行末尾是分号)：
```tsx
interface IProps {
  id: number; // 1
  name?: string; // 'test' or not exist
  isFetching: boolean; // true | false
  list: number[]; // [1, 2, 3]
  tuple: [string, number]; // ['hello', 10]
  userRole: UserRoleType; // enum: ADMIN | DEVELOPER | TESTER
  detail: object; // { id: 3 }
  wtf: any;
  unusable: void; // undefined | null
  projectActivities?: boolean; // optional
  messageListMap: map<string, obj>;
  changePageNo?(pageNo: number, data: Date): void;
  onChange?(e: Event): void;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
  // 其他用法
  readonly constValue: 'CONST'; // 禁止给该属性赋值
  readonly [index: number]: string; // 禁止给索引赋值
  [propName: string]: any; // any other property
}

enum UserRoleType {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  TESTER = 'TESTER',
}
```

混合类型：
例如一个对象可以同时做为函数和对象使用，并带有额外的属性。
```tsx
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

function getCounter(): Counter {
  let counter = <Counter>function (start: number) { };
  counter.interval = 123;
  counter.reset = function () { };
  return counter;
}

let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
```

### 3.3 重构纯函数组件
```tsx
import * as React from 'react';
import { Spin } from 'nusi';
import { resolvePath } from 'common/utils';
import { ProjectCard } from 'common';
import './projects.scss';

// 定义单个项目的结构类型
interface PROJECT.Detail {
  id: number;
  name: string;
}

// 定义props的结构类型
interface IProps {
  projects: [PROJECT.Detail];
  isFetching: boolean;
}

// 函数参数添加类型, 返回添加类型
const Projects = ({ projects, isFetching }: IProps): JSX.Element => {
  return (
    <Spin spinning={isFetching}>
      <div className="profile-projects-list">
        {
          // 参数添加类型
          projects.map(prj => <ProjectCard key={prj.id} linkTo={(id: number) => resolvePath(`/projects/${id}/apps`)} project={prj} />)
        }
      </div>
    </Spin>
  );
};

export default Projects;
```

### 3.4 重构类形式组件
```tsx
interface IProps {
  name?: string; // 'test' or not exist
  changePageNo?(pageNo: number): void;
}

interface IState {
  pageNo: number;
}

class Comp extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      pageNo: 1,
    };
  }

  ...
}
```
