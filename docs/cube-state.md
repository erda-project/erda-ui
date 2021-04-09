# Cube-state 迁移指南

## 新功能开发

1. 添加`{service}.ts`接口文件，接口如果用到了返回值则必须写返回值类型，例如：

```javascript
export const getUserList = (params: { pageNo: number, pageSize: number }): {
  list: IPlatformUser[],
  total: number,
} => {
  return agent.get('/api/users/actions/paging')
    .query(params)
    .then((response: any) => response.body);
};
```

2. stores目录下新增`{store}.ts`文件，配置state的类型和effects、reducers payload的类型

3. 使用函数形式的组件，并引入需要用到的store文件

4. 对上面步骤中出现的可复用类型，统一在types目录下新增对应名称的d.ts类型定义文件


## 旧功能迁移

1. 修改service文件，新增接口的类型定义

2. 迁移model文件中内容到新增的store文件中，修改effects、reducer等方法，注意没有put等方法了，使用`await curStore.effects.fn()`形式替换

3. 修改函数式组件，只要把对应connect里取的prop改为从store里取，如果没有要从connect里取的内容则移除connect。

4. 修改类式组件，改为函数式，或者包裹一层函数式组件用于从store里取prop，把IProp里的定义都替换为`typeof curStore.xx.xx`的形式。例如：

```javascript
import orgStore from 'admin/stores/orgs';

interface IProps {
  orgList: typeof orgStore.stateType.orgList;
  orgPaging: typeof orgStore.stateType.orgPaging;
  getOrgAdmins: typeof orgStore.effects.getOrgAdmins;
  setQueryKey: typeof orgStore.reducers.setQueryKey;
}

class OrgManageList extends Component<IProps> {
  render() {

  }
}
```
