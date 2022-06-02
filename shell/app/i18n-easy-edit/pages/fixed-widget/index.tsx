import React from 'react';
import { Badge, Popover } from 'antd';
import { ErdaIcon } from 'common';
import store from '../../store';

interface IProps {
  setPublishVisible: (value: boolean) => void;
  editCount: number;
}
const FixedWidget = (props: IProps) => {
  const [editable, setEditable] = React.useState(false);
  const clickHandler = (e) => {
    setEditable(!editable);
  };
  React.useEffect(() => {
    store.reducers.switchIsEditable(editable);
  }, [editable]);

  // publish
  const publishClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    props.setPublishVisible(true);
  };
  const publishRender = <a onClick={publishClick}>Publish</a>;

  return (
    <>
      <div className="i18n-switch fixed z-50 bottom-20 right-10 cursor-pointer" onClick={clickHandler}>
        <Badge count={props.editCount} size="small">
          {editable ? (
            <Popover content={publishRender}>
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

export default FixedWidget;
