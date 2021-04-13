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

import { Copy, IF, Icon as CustomIcon } from 'common';
import i18n from 'i18n';
import React from 'react';
import { WithAuth } from 'user/common';
import { Drawer, Icon, Spin, Popconfirm, Input, message, NusiPopover as Popover } from 'app/nusi';
import './issue-drawer.scss';

type ElementChild = React.ElementType | JSX.Element | string;

interface IProps {
  children: ElementChild[] | undefined[],
  visible: boolean,
  editMode: boolean,
  className?: string,
  loading?: boolean,
  canDelete?: boolean,
  canCreate?: boolean,
  shareLink?: string,
  subDrawer?: JSX.Element | null,
  confirmCloseTip?: string,
  maskClosable?: boolean,
  onClose(e: any): void;
  onDelete?(): void;
  handleCopy?(isCopy: boolean, copyTitle: string): void;
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
  const { className = '', canCreate = false, canDelete = false, subDrawer = null, children, editMode, shareLink, loading = false, visible, onClose, onDelete, confirmCloseTip, handleCopy, ...rest } = props;
  const [
    title = IssueDrawer.Empty,
    main = IssueDrawer.Empty,
    tabs = IssueDrawer.Empty,
    meta = IssueDrawer.Empty,
    footer = IssueDrawer.Empty,
  ] = React.Children.toArray(children);
  const [copyTitle, setCopyTitle] = React.useState('');

  return (
    <Drawer
      className={`task-drawer ${className}`}
      width="908"
      placement="right"
      closable={false}
      visible={visible}
      onClose={onClose}
      {...rest}
    >
      <Spin spinning={loading}>
        <IF check={title !== IssueDrawer.Empty}>
          <div className="task-drawer-header">
            <div className="flex-box">
              <div className="flex-1 nowrap">
                {title}
              </div>
              <div className="task-drawer-op">
                <IF check={editMode && shareLink}>
                  <Copy selector=".copy-share-link" tipName={i18n.t('project:share link')} />
                  <Icon className="for-copy copy-share-link mr4" data-clipboard-text={shareLink} type="share-alt" />
                </IF>
                <IF check={editMode}>
                  <WithAuth pass={canCreate}>
                    <Popover
                      title={i18n.t('project:copy issue')}
                      content={
                        <Input
                          placeholder={i18n.t('project:Please enter the issue title')}
                          style={{ width: 400 }}
                          value={copyTitle}
                          onChange={(e) => setCopyTitle(e.target.value)}
                        />
                    }
                      onOk={() => {
                        if (copyTitle === '') {
                          message.error(i18n.t('project:The title can not be empty'));
                          return;
                        }
                        handleCopy && handleCopy(true, copyTitle);
                        setCopyTitle('');
                      }}
                      onCancel={() => setCopyTitle('')}
                      placement="leftTop"
                      trigger="click"
                      okText={i18n.t('copy')}
                    >
                      <CustomIcon type="fz1" className="hover-active" />
                    </Popover>
                  </WithAuth>
                </IF>
                {
                  onDelete
                    ? (
                      <WithAuth pass={canDelete} >
                        <Popconfirm title={`${i18n.t('common:confirm deletion')}?`} placement="bottomRight" onConfirm={onDelete}>
                          <CustomIcon type="shanchu" className="hover-active" />
                        </Popconfirm>
                      </WithAuth>
                    )
                    : null
                }
                {
                  confirmCloseTip ? (
                    <Popconfirm title={confirmCloseTip} placement="bottomRight" onConfirm={onClose}>
                      <Icon type="close" />
                    </Popconfirm>
                  )
                    : <Icon type="close" onClick={onClose} />
                }
              </div>
            </div>
          </div>
        </IF>
        {subDrawer}
        <div className="task-drawer-body" style={footer !== IssueDrawer.Empty ? { paddingBottom: '60px' } : {}}>
          <div className="task-drawer-main">
            <div className="task-drawer-content">
              {main}
            </div>
            <div className="task-drawer-tabs">
              {tabs}
            </div>
          </div>
          <IF check={meta !== IssueDrawer.Empty}>
            <div className="task-drawer-meta">
              {meta}
            </div>
          </IF>
        </div>
      </Spin>
      <IF check={footer !== IssueDrawer.Empty}>
        <div className="task-drawer-footer">
          {footer}
        </div>
      </IF>
    </Drawer>
  );
};

IssueDrawer.Empty = '__Empty__';
