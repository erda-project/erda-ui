import React from 'react';
import { Badge, Popover, Popconfirm } from 'antd';
import { ErdaIcon } from 'common';
import store from '../../store';
import iterationStore from 'project/stores/iteration';
import { clearLocalStorage, mergeLocalStorage2JSON } from '../../utils';

const App: React.FC = (props) => {
  const [editable, setEditable] = React.useState(false);
  const clickHandler = (e) => {
    setEditable(!editable);
  };
  React.useEffect(() => {
    store.reducers.switchIsEditable(editable);
  }, [editable]);

  // publish
  const publishHandler = () => {
    // 1. 请求 添加事项 的接口
    // TODO: projectID ？
    const issueData = {
      title: 'i18n文案修改',
      type: 'TASK',
      content: mergeLocalStorage2JSON(),
      projectID: 2210,
    };
    const { createIssue } = iterationStore.effects;
    createIssue(issueData).then(() => {
      // 2. 清空 i18n 本地存储
      clearLocalStorage();
    });
  };
  const confirmHandler = () => {
    publishHandler();
  };
  const publish = (
    <Popconfirm
      title="Are you sure to publish?"
      onConfirm={confirmHandler}
      okText="Yes"
      cancelText="No"
      // onClick={(e) => e.stopPropagation()}
    >
      <a href="#" onClick={(e) => e.stopPropagation()}>
        Publish
      </a>
    </Popconfirm>
  );

  return (
    <>
      <div className="i18n-switch fixed bottom-20 right-10 cursor-pointer" onClick={clickHandler}>
        <Badge count={props.editCount} size="small">
          {editable ? (
            <Popover content={publish}>
              <ErdaIcon size="30" className="scroll-top-btn" type="dakai" />
            </Popover>
          ) : (
            <ErdaIcon size="30" className="scroll-top-btn" type="guanbi-495gie5a" />
          )}
        </Badge>
      </div>
    </>
  );
};

export default App;
