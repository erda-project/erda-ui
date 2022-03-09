// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import { Copy, ErdaIcon } from 'common';
import i18n from 'i18n';
import React from 'react';
import useEvent from 'react-use/lib/useEvent';
import { WithAuth } from 'user/common';
import issueStore from 'project/stores/issues';
import { isEqual, find } from 'lodash';
import { Drawer, Spin, Popconfirm, Input, message, Popover, Button, Modal } from 'antd';
import { SubscribersSelector } from './subscribers-selector';
import layoutStore from 'layout/stores/layout';
import './issue-drawer.scss';
import { useScroll } from 'react-use';

type ElementChild = React.ElementType | JSX.Element | string;

interface IProps {
  children: ElementChild[] | undefined[];
  visible: boolean;
  editMode: boolean;
  className?: string;
  loading?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
  shareLink?: string;
  confirmCloseTip?: string;
  maskClosable?: boolean;
  data: CreateDrawerData;
  issueType: string;
  projectId: string;
  issueTitle?: JSX.Element;
  extraHeaderOp?: JSX.Element | React.ElementType | null;
  onClose: (e: any) => void;
  onDelete?: () => void;
  handleCopy?: (isCopy: boolean, copyTitle: string) => void;
  setData: (data: object) => void;
  footer: ElementChild[] | ((isChanged: boolean, confirmCloseTip: string | undefined) => ElementChild[]);
}

/**
 * 任务、需求、缺陷、测试用例等Drawer
 * @note 按照title、main、tabs、meta、footer的顺序在children中书写, 不需要的区块使用 {IssueDrawer.Empty} 占位
 *
 * @param editMode 编辑模式
 * @param shareLink 分享链接，创建模式时无效
 * @param handleBlur body上捕获的blur事件监听器
 * @param className
 * @param loading
 * @param visible
 * @param onClose
 */
export const IssueDrawer = (props: IProps) => {
  const {
    className = '',
    canCreate = false,
    canDelete = false,
    children,
    editMode,
    shareLink,
    loading = false,
    visible,
    onClose,
    onDelete,
    confirmCloseTip,
    handleCopy,
    maskClosable,
    data,
    issueType,
    projectId,
    setData,
    footer = IssueDrawer.Empty,
    issueTitle = null,
    extraHeaderOp = null,
    ...rest
  } = props;
  const [
    title = IssueDrawer.Empty,
    formField = IssueDrawer.Empty,
    relationField = IssueDrawer.Empty,
    logField = IssueDrawer.Empty,
  ] = React.Children.toArray(children);

  const customFieldDetail = issueStore.useStore((s) => s.customFieldDetail);
  const [isImagePreviewOpen, issueCommentBoxVisible] = layoutStore.useStore((s) => [
    s.isImagePreviewOpen,
    s.issueCommentBoxVisible,
  ]);
  const [copyTitle, setCopyTitle] = React.useState('');
  const [isChanged, setIsChanged] = React.useState(false);
  const [showCopy, setShowCopy] = React.useState(false);
  const preDataRef = React.useRef(data);
  const preData = preDataRef.current;

  const escClose = React.useCallback(
    (e) => {
      if (issueCommentBoxVisible) {
        return;
      }
      if (e.keyCode === 27) {
        if (isImagePreviewOpen) {
          return;
        }
        if (isChanged && confirmCloseTip) {
          Modal.confirm({
            title: confirmCloseTip,
            onOk() {
              onClose(e);
            },
          });
        } else {
          onClose(e);
        }
      }
    },
    [issueCommentBoxVisible, isImagePreviewOpen, isChanged, confirmCloseTip, onClose],
  );

  useEvent('keydown', escClose);

  React.useEffect(() => {
    const isIssueDrawerChanged = (initData: CreateDrawerData, currentData: CreateDrawerData) => {
      setIsChanged(false);

      Object.keys(currentData).forEach((key) => {
        if (key in initData) {
          if (!isEqual(initData[key], currentData[key])) {
            setIsChanged(true);
          }
        } else {
          const defaultValue = find(customFieldDetail?.property, { propertyName: key })?.values;

          // Determine whether the field has changed. When the value is the following conditions, the field has not changed
          const notChange =
            isEqual(defaultValue, currentData[key]) ||
            currentData[key] === undefined ||
            currentData[key] === '' ||
            isEqual(currentData[key], []) ||
            isEqual(currentData[key], { estimateTime: 0, remainingTime: 0 });

          if (!notChange) {
            setIsChanged(true);
          }
        }
      });
    };
    isIssueDrawerChanged(preData, data);
  }, [customFieldDetail?.property, data, preData]);

  const mainEle = React.useRef<HTMLDivElement>(null);
  const { y } = useScroll(mainEle);

  return (
    <Drawer
      className={`task-drawer ${className}`}
      width="80vw"
      placement="right"
      closable={false}
      visible={visible}
      onClose={onClose}
      maskClosable={maskClosable || !isChanged}
      keyboard={false}
      {...rest}
    >
      <Spin spinning={loading}>
        <div className="flex flex-col h-full">
          <If condition={title !== IssueDrawer.Empty}>
            <div className={`task-drawer-header ${y > 2 ? 'shadow-card' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="flex-1 nowrap">{title}</div>
                <div className="task-drawer-op flex items-center">
                  {extraHeaderOp}
                  <SubscribersSelector
                    subscribers={data.subscribers}
                    issueID={customFieldDetail?.issueID}
                    issueType={issueType}
                    projectId={projectId}
                    setData={setData}
                    data={data}
                  />
                  <If condition={editMode && shareLink}>
                    <Copy selector=".copy-share-link" tipName={i18n.t('dop:share link')} />
                    <ErdaIcon
                      type="lianjie"
                      className="cursor-copy hover-active copy-share-link ml-4 text-default-6"
                      size="20"
                      data-clipboard-text={shareLink}
                    />
                  </If>
                  <If condition={editMode}>
                    <WithAuth pass={canCreate}>
                      <Popover
                        title={i18n.t('dop:copy issue')}
                        visible={showCopy}
                        onVisibleChange={(v) => setShowCopy(v)}
                        content={
                          <>
                            <Input
                              placeholder={i18n.t('dop:Please enter the issue title')}
                              style={{ width: 400 }}
                              value={copyTitle}
                              onChange={(e) => setCopyTitle(e.target.value)}
                            />
                            <div className="flex items-center flex-wrap justify-end mt-2">
                              <Button
                                className="mr-2"
                                onClick={() => {
                                  setCopyTitle('');
                                  setShowCopy(false);
                                }}
                              >
                                {i18n.t('cancel')}
                              </Button>
                              <Button
                                onClick={() => {
                                  if (copyTitle === '') {
                                    message.error(i18n.t('dop:The title can not be empty'));
                                    return;
                                  }
                                  handleCopy && handleCopy(true, copyTitle);
                                  setCopyTitle('');
                                  setShowCopy(false);
                                }}
                                type="primary"
                              >
                                {i18n.t('copy')}
                              </Button>
                            </div>
                          </>
                        }
                        placement="leftTop"
                        trigger="click"
                      >
                        <ErdaIcon type="fuzhi" className="hover-active ml-4 text-default-6" size="20" />
                      </Popover>
                    </WithAuth>
                  </If>
                  {onDelete ? (
                    <WithAuth pass={canDelete}>
                      <Popconfirm
                        title={`${i18n.t('common:confirm deletion')}?`}
                        placement="bottomRight"
                        onConfirm={onDelete}
                      >
                        <ErdaIcon type="shanchu-4d7l02mb" className="hover-active ml-4 text-default-6" size="20" />
                      </Popconfirm>
                    </WithAuth>
                  ) : null}
                  {isChanged && confirmCloseTip ? (
                    <Popconfirm title={confirmCloseTip} placement="bottomRight" onConfirm={onClose}>
                      <ErdaIcon type="guanbi" className="ml-4 hover-active text-default-6" size="20" />
                    </Popconfirm>
                  ) : (
                    <ErdaIcon type="guanbi" className="ml-4 hover-active text-default-6" size="20" onClick={onClose} />
                  )}
                </div>
              </div>
              {issueTitle}
            </div>
          </If>
          <div
            ref={mainEle}
            className="flex-1 px-8 overflow-x-hidden overflow-y-auto"
            style={footer !== IssueDrawer.Empty ? { paddingBottom: '60px' } : {}}
          >
            <If condition={formField !== IssueDrawer.Empty}>{formField}</If>
            <If condition={relationField !== IssueDrawer.Empty}>
              <div className="h-[1px] bg-default-08 my-4" />
              {relationField}
            </If>
            <If condition={logField !== IssueDrawer.Empty}>
              <div className="h-[1px] bg-default-08 my-4" />
              {logField}
            </If>
          </div>
          <If condition={footer !== IssueDrawer.Empty}>
            <div className="task-drawer-footer">
              {typeof footer === 'function' ? footer(isChanged, confirmCloseTip) : footer}
            </div>
          </If>
        </div>
      </Spin>
    </Drawer>
  );
};

IssueDrawer.Empty = '__Empty__';
