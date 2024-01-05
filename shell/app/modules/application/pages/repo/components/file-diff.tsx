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

import { Tooltip, Radio, Button, Modal, Empty, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { encode } from 'js-base64';
import moment from 'moment';
import i18n from 'i18n';
import { diff_match_patch as Diff } from 'diff-match-patch';
import { EmptyListHolder, Icon as CustomIcon, IF, BackToTop, ErdaIcon, MarkdownRender } from 'common';
import { last, map, isEmpty } from 'lodash';
import classnames from 'classnames';
import { getFileCommentMap } from './mr-comments';
import MarkdownEditor from 'common/components/markdown-editor';
import { isImage, setApiWithOrg, getOrgFromPath } from 'common/utils';
import { CommentBox } from 'application/common/components/comment-box';
import { erdaEnv } from 'common/constants';
import { ChatProvider, Chat as TChart } from '@terminus/ai-components';
import 'requestidlecallback-polyfill';
import './file-diff.scss';
import repoStore from 'application/stores/repo';
import appStore from 'application/stores/application';
import routeInfoStore from 'core/stores/route';
import userStore from 'app/user/stores';
import orgStore from 'app/org-home/stores/org';
import { getLogs } from 'layout/services/ai-chat';

const diffTool = new Diff();
const { ELSE } = IF;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const getExpandParams = (path: string, sections: any[], content: string) => {
  let bottom = false;
  let lastLineNo;
  let firstLineNo;
  let offset = 0;
  let sectionIndex = 0;
  if (content === '') {
    bottom = true;
    lastLineNo = (last(sections[sections.length - 2].lines) as any).newLineNo;
    sectionIndex = sections.length - 2;
  } else {
    sectionIndex = sections.findIndex((x) => x.lines[0].content === content);
    const currentSection = sections[sectionIndex];
    firstLineNo = currentSection.lines[1].newLineNo;
  }
  const lastSectionLine = sectionIndex > 0 && !bottom ? last(sections[sectionIndex - 1].lines) : null;
  let unfold = bottom;
  let since = bottom ? lastLineNo + 1 : 1;
  const to = bottom ? lastLineNo + 20 : firstLineNo - 1;
  if (!bottom) {
    if (lastSectionLine && firstLineNo - (lastSectionLine as any).newLineNo <= 20) {
      since = (lastSectionLine as any).newLineNo + 1;
    } else if (firstLineNo <= 21) {
      since = 1;
    } else {
      since = firstLineNo - 21;
      unfold = true;
    }
    if (lastSectionLine) {
      offset = (lastSectionLine as any).newLineNo - (lastSectionLine as any).oldLineNo;
    }
  }
  return { path, since, to, bottom, unfold, offset, sectionIndex };
};

const CommentIcon = ({ disableComment, onClick }: { disableComment?: boolean; onClick: () => void }) =>
  disableComment ? null : (
    <ErdaIcon className="hover-active comment-icon select-none" type="add-one" onClick={onClick} />
  );

const AI_BACKEND_URL = erdaEnv.AI_BACKEND_URL || 'https://ai-proxy.erda.cloud';
const AI_PROXY_CLIENT_AK = erdaEnv.AI_PROXY_CLIENT_AK || '21b58e59f4ad4c46b0c7c70f6b76d8f5';

const CommentListBox = ({ comments }: { comments: REPOSITORY.IComment[] }) => {
  if (!comments) {
    return null;
  }

  return (
    <>
      {comments.map((comment: REPOSITORY.IComment, index) => {
        const { data } = comment;
        const { newLine, newLineTo, oldLine, oldLineTo } = data;
        return (
          <>
            <IF check={index === 0}>
              <div className="mb-2 text-base">
                {i18n.t('comment')}
                {i18n.t('line')}{' '}
                {`${newLineTo}` === '0' && `${oldLineTo}` === '0'
                  ? getSingleLineIndex(oldLine, newLine)
                  : i18n.t('from {start} to {end}', getTwoLineIndex(oldLine, newLine, oldLineTo, newLineTo))}
              </div>
            </IF>

            {comment.data.aiSessionID ? (
              <AICommentBox comment={comment} />
            ) : (
              <CommentBox
                key={comment.id}
                user={comment.role === 'AI' ? 'AI' : comment.author.nickName}
                time={comment.createdAt}
                action={i18n.t('dop:commented at')}
                content={comment.note || ''}
              />
            )}
          </>
        );
      })}
    </>
  );
};

const AICommentBox = ({ comment }: { comment: REPOSITORY.IComment }) => {
  const { id: userId, nick: name, phone, email } = userStore.getState((s) => s.loginUser);
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const [isEdit, setIsEdit] = useState(false);
  const [list, setList] = useState<Array<{ time: string; content: string; role: string }>>([]);

  useEffect(() => {
    if (isEdit && comment.data.aiSessionID) {
      loadLogs(comment.data.aiSessionID);
    }
  }, [isEdit, comment.data.aiSessionID]);

  const loadLogs = async (chatId: string) => {
    const res = await getLogs({ userId, name, phone, email, id: chatId });
    if (res.success) {
      const {
        data: { list: _list },
      } = res;
      const messages = [] as Array<{ time: string; content: string; role: string }>;
      _list.reverse().forEach((item) => {
        messages.push({ role: 'user', content: item.prompt, time: moment(item.requestAt).format('YYYY-MM-DD') });
        messages.push({
          role: 'assistant',
          content: item.completion,
          time: moment(item.responseAt).format('YYYY-MM-DD'),
        });
      });
      setList(messages);
    }
  };

  return isEdit ? (
    <div>
      <div className="border-all my-2 mr-4">
        <ChatProvider>
          <TChart
            getMsgfetchConfig={{
              path: `${AI_BACKEND_URL}/v1/chat/completions`,
              getBody: (messages) => ({
                // model: 'gpt-35-turbo-16k',
                messages: [
                  {
                    role: 'user',
                    content: messages[messages?.length - 1].content,
                  },
                ],
                stream: true,
              }),
              headers: {
                'X-Ai-Proxy-User-Id': encode(userId),
                'X-Ai-Proxy-Username': encode(name),
                'X-Ai-Proxy-Phone': encode(phone),
                'X-AI-Proxy-Email': encode(email),
                'X-Ai-Proxy-Source': 'erda.cloud',
                'X-Ai-Proxy-Org-Id': encode(`${orgId}`),
                'X-AI-Proxy-Session-Id': `${comment.data.aiSessionID}`,
                'X-AI-Proxy-Prompt-Id': '',
                Authorization: AI_PROXY_CLIENT_AK,
              },
              formatResult: (msgData) => {
                const { data } = msgData;
                if (data !== '[DONE]') {
                  const dataObj = JSON.parse(data);
                  const { choices } = dataObj;
                  const { delta } = choices[0] || {};
                  const { content } = delta || {};
                  return { data: content || '' };
                }
                return { data: '' };
              },
            }}
            toolbarConfig={{
              historyConfig: { show: false },
              promptConfig: { show: false },
              chatConfig: { show: false },
            }}
            messages={list}
          />
        </ChatProvider>
      </div>
      <Button onClick={() => setIsEdit(false)}>{i18n.t('Cancel')}</Button>
    </div>
  ) : (
    <div className="">
      <CommentBox
        key={comment.id}
        user={comment.role === 'AI' ? 'AI' : comment.author.nickName}
        time={comment.createdAt}
        action={i18n.t('dop:commented at')}
        content={comment.note || ''}
      />
      <Button onClick={() => setIsEdit(true)}>{i18n.t('Continue the AI conversation')}</Button>
    </div>
  );
};

interface IProps {
  file: REPOSITORY.IFile;
  commentMap: {
    [prop: string]: REPOSITORY.IComment[];
  };
  title: string | React.ReactElement;
  getBlobRange?: null | Function;
  showStyle?: 'inline' | 'sideBySide';
  disableComment?: boolean;
  hideSectionTitle?: boolean;
  mode: string;
  appDetail: {
    gitRepoAbbrev: string;
  };
  forwardRef?: React.Ref<HTMLDivElement>;
  addComment: (data: object) => Promise<any>;
  titleSlot?: React.ReactNode;
}

const generateDiffFilePath = (oldName: string, name: string) => {
  const old: React.ReactElement[] = [];
  const now: React.ReactElement[] = [];
  if (oldName === name) {
    return { old, now };
  }
  const diff = diffTool.diff_main(oldName, name);
  diffTool.diff_cleanupSemantic(diff);

  diff.forEach((part: any[]) => {
    const [type, content] = part;
    if (type === -1) {
      old.push(
        <span key={`${type}-${content}`} className="highlight-red">
          {content}
        </span>,
      );
    } else if (type === 1) {
      now.push(
        <span key={`${type}-${content}`} className="highlight-green">
          {content}
        </span>,
      );
    } else {
      old.push(<span key={`${type}-${content}`}>{content}</span>);
      now.push(<span key={`${type}-${content}`}>{content}</span>);
    }
  });
  return { old, now };
};

enum ACTION {
  ADD = 'add',
  DELETE = 'delete',
  RENAME = 'rename',
}

export const FileDiff = ({
  file,
  commentMap,
  title,
  getBlobRange = null,
  showStyle,
  addComment,
  disableComment,
  hideSectionTitle,
  mode,
  forwardRef,
  appDetail,
  titleSlot,
}: IProps) => {
  const [expandedFile, setExpandedFile] = React.useState(null);
  const memoFile = React.useMemo(() => {
    return expandedFile || file;
  }, [expandedFile, file]);
  const { oldName, name, type, sections, issues = [], isBin = false, index: commitId } = memoFile;
  const diffSize = (sections || []).reduce((size, value) => size + value.lines.length, 0);
  const DIFF_SIZE_LIMIT = 200;
  const mrDetail = repoStore.useStore((s) => s.mrDetail);
  const { state } = mrDetail;
  const [leftCommentEditVisible, setLeftCommentEditVisible] = useState({});
  const [rightCommentEditVisible, setRightCommentEditVisible] = useState({});
  const [isExpanding, setFileExpanding] = useState(diffSize < DIFF_SIZE_LIMIT);
  const [isShowLS, setIsShowLS] = useState({});

  const { projectId, appId, mergeId } = routeInfoStore.useStore((s) => s.params);

  if (!sections) {
    if (type === ACTION.ADD || type === ACTION.DELETE || type === ACTION.RENAME || isBin) {
      // TODO isBin 如何显示需要后续处理
      const { old, now } = generateDiffFilePath(oldName, name);
      const fileSrcPrefix = `/api/${getOrgFromPath()}/repo/${appDetail.gitRepoAbbrev}/raw`;
      const fileIsImage = isImage(name);
      const imageAddress = fileIsImage ? `${fileSrcPrefix}/${commitId}/${name}` : '';

      const text =
        {
          [ACTION.ADD]: <ErdaIcon type="file-addition" className="text-base text-green" />,
          [ACTION.DELETE]: <ErdaIcon type="delete1" className="text-base text-red" />,
          [ACTION.RENAME]: i18n.t('dop:file moved'),
        }[type] || '';

      return (
        <div ref={forwardRef} className="file-diff">
          <IF check={type === 'rename'}>
            <div className="file-title-move">
              <div className="font-bold nowrap">
                <ErdaIcon type="file-code-one" size="14" className="mr-2" />
                {old}
              </div>
              <ErdaIcon type="arrow-right" className="file-move-arrow" />
              <div className="font-bold nowrap">{now}</div>
            </div>
            <div className="file-static-info">{text}</div>
            <IF.ELSE />
            <div className="file-title inline-flex justify-between items-center">
              <div className="font-bold nowrap">
                <ErdaIcon type="file-code-one" size="14" className="mr-2" />
                {name} {text || null}
              </div>
            </div>
            <IF check={fileIsImage}>
              <div className="text-center my-4">
                <img src={setApiWithOrg(imageAddress)} alt={`${name || 'preview-image'}`} />
              </div>
            </IF>
          </IF>
        </div>
      );
    }
    return null;
  }
  const issueLineMap = {};
  issues.forEach((issue) => {
    issueLineMap[issue.line] = issue;
  });

  const toggleLeftCommentEdit = (lineKey: string, visible: boolean) => {
    setLeftCommentEditVisible({
      ...leftCommentEditVisible,
      [lineKey]: visible,
    });
    setIsShowLS({
      ...isShowLS,
      [lineKey]: false,
    });

    if (!visible) {
      setStartRowIndex(0);
      setEndRowIndex(0);
      updateRowSelection(false);
    }
  };

  const toggleRightCommentEdit = (lineKey: string, visible: boolean) => {
    setRightCommentEditVisible({
      ...rightCommentEditVisible,
      [lineKey]: visible,
    });

    if (!visible) {
      setStartRowIndex(0);
      setEndRowIndex(0);
      updateRowSelection(false);
    }
  };

  const [tableData, setTableData] = useState<Obj[]>(sections);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [startRowIndex, setStartRowIndex] = useState<number>(0);
  const [endRowIndex, setEndRowIndex] = useState<number>(0);
  const [commentLineKey, setCommentLineKey] = useState<string>('');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  React.useEffect(() => {
    setTableData(sections);
  }, [sections]);

  const handleMouseDown = (i: number, index: number) => {
    setCurrentSectionIndex(i);
    setIsMouseDown(true);
    setStartRowIndex(index);
  };

  const handleMouseEnter = (index: number, i: number, lineKey: string) => {
    if (isMouseDown) {
      setCurrentSectionIndex(i);
      setEndRowIndex(index);
      setCommentLineKey(lineKey);
    }
  };

  const handleMouseUp = () => {
    if (isMouseDown && endRowIndex) {
      setIsMouseDown(false);
      toggleLeftCommentEdit(commentLineKey, true);
    }
  };

  React.useEffect(() => {
    startRowIndex !== endRowIndex && updateRowSelection(true);
  }, [endRowIndex]);

  const updateRowSelection = (isSelected: boolean) => {
    setTableData((prevData) => {
      const newSections = [...prevData];
      const newData = [...newSections[currentSectionIndex].lines];
      newData.forEach((item, index) => {
        if (index >= startRowIndex && index <= endRowIndex) {
          item.selected = isSelected;
        } else {
          item.selected = false;
        }
      });
      return newSections;
    });
  };

  return (
    <div ref={forwardRef} className="file-diff">
      <div
        className="file-title"
        onClick={() => {
          setFileExpanding(!isExpanding);
        }}
      >
        {title || (
          <div className="font-bold flex items-center">
            <IF check={!isExpanding}>
              <ErdaIcon type="right-one" size="18px" className="mr-2" />
              <ELSE />
              <ErdaIcon type="caret-down" size="18px" className="mr-2" />
            </IF>
            <ErdaIcon type="file-code-one" size="14" className="mr-2" />
            {name}
            {titleSlot}
          </div>
        )}
      </div>
      <IF check={!isExpanding}>
        <div className="file-content-collapsed">
          {i18n.t('dop:comparison result has been folded')}。
          <span
            className="click-to-expand text-link"
            onClick={() => {
              setFileExpanding(!isExpanding);
            }}
          >
            {i18n.t('dop:click to expand')}
          </span>
        </div>
        <ELSE />
        <table>
          {tableData.map((section, i) => {
            const prefixMap = {
              delete: '-',
              add: '+',
            };

            const fileKey = `${name}_${i}`;
            return (
              <tbody key={`${showStyle}_${fileKey}`} className="file-diff-section" onMouseUp={handleMouseUp}>
                {section.lines.map(({ oldLineNo, newLineNo, type: actionType, content, selected }, lineIndex) => {
                  if (hideSectionTitle && actionType === 'section') {
                    return null;
                  }

                  const hasWhiteSpace = content.match(/^\s+/);
                  let _content: any = content;
                  let paddingLeft = 0;
                  if (hasWhiteSpace && content.startsWith('\t')) {
                    const spaceLength = hasWhiteSpace[0].length;
                    // tab缩进使用2个em空白显示
                    paddingLeft = spaceLength * 2;
                    _content = _content.slice(spaceLength);
                  }
                  let leftContent = content;
                  let rightContent = content;
                  if (actionType === 'add') {
                    leftContent = '';
                    rightContent = content;
                  } else if (actionType === 'delete') {
                    leftContent = content;
                    rightContent = '';
                  }
                  const lineIssue = issueLineMap[newLineNo];
                  if (lineIssue) {
                    const { textRange, message } = lineIssue;
                    _content = (
                      <span>
                        <span>{content.slice(0, textRange.startOffset)}</span>
                        <Tooltip title={message}>
                          <span className="issue-word">
                            {content.slice(textRange.startOffset, textRange.endOffset)}
                          </span>
                        </Tooltip>
                        <span>{content.slice(textRange.endOffset)}</span>
                      </span>
                    );
                  }
                  const isUnfoldLine = oldLineNo === -1 && newLineNo === -1;
                  const unfoldClassName = isUnfoldLine && getBlobRange ? 'unfold-btn' : '';
                  const oldPrefix = oldLineNo > 0 ? oldLineNo : '';
                  const newPrefix = actionType && newLineNo > 0 ? newLineNo : '';
                  const actionPrefix = prefixMap[actionType] || '';
                  const codeStyle: React.CSSProperties = {
                    paddingLeft: `${paddingLeft}em`,
                    whiteSpace: 'pre-wrap',
                    display: 'inline-block',
                  };
                  const handleExpand = async () => {
                    if (oldLineNo !== -1 || newLineNo !== -1 || !getBlobRange) {
                      return;
                    }
                    const params = getExpandParams(file.name, sections, content);
                    const updatedFile = await getBlobRange({ ...params, type: mode });
                    setExpandedFile(updatedFile);
                  };
                  const lineKey = `${oldLineNo}_${newLineNo}`;
                  const comments = actionType && commentMap[lineKey];
                  // 编辑框显示条件：只判断icon点击后的状态
                  const showLeftCommentEdit = leftCommentEditVisible[lineKey];
                  // icon显示条件：未禁用、无数据（有的话通过回复按钮显示编辑框）、lineNo不为-1、编辑框未显示
                  const showLeftCommentIcon =
                    state === 'open' && !disableComment && !comments && oldLineNo !== -1 && !showLeftCommentEdit;
                  // 如果有数据或者编辑框，显示追加行
                  const showLeftCommentLine = comments || showLeftCommentEdit;
                  // 暂存key
                  const tsKey = `mr-comment-${projectId}-${appId}-${mergeId}-${name}-${lineKey}`;

                  const tsCommentObj = localStorage.getItem(tsKey);

                  const tsComment = tsCommentObj ? JSON.parse(tsCommentObj) : {};

                  const showRightCommentEdit = rightCommentEditVisible[lineKey];
                  const showRightCommentIcon =
                    state === 'open' && !disableComment && !comments && newLineNo !== -1 && !showRightCommentEdit;
                  const showRightCommentLine = comments || showRightCommentEdit;

                  const addCommentFn = (_data: object) => {
                    const startLine = section.lines[startRowIndex] || {};
                    let data = {
                      type: 'diff_note',
                      oldPath: oldName,
                      newPath: name,
                      oldLine: startLine.oldLineNo,
                      newLine: startLine.newLineNo,
                      oldLineTo: oldLineNo,
                      newLineTo: newLineNo,
                      ..._data,
                    } as any;
                    if (comments) {
                      data = {
                        type: 'diff_note_reply',
                        discussionId: comments[comments.length - 1].discussionId,
                        ..._data,
                      };
                    }
                    if (tsCommentObj) {
                      localStorage.removeItem(tsKey);
                    }
                    return addComment(data);
                  };

                  const lineCls = classnames({
                    'file-diff-line': true,
                    [actionType]: true,
                    'issue-line': lineIssue,
                  });

                  const startLine = section.lines[startRowIndex];
                  const endLine = section.lines[endRowIndex];

                  const startLineKey = `${startLine?.oldLineNo}_${startLine?.newLineNo}`;
                  const endLineKey = `${endLine?.oldLineNo}_${endLine?.newLineNo}`;

                  const isCommentEditVisible =
                    Object.keys(leftCommentEditVisible).find((key) => leftCommentEditVisible[key]) ||
                    Object.keys(rightCommentEditVisible).find((key) => rightCommentEditVisible[key]);

                  if (showStyle === 'inline') {
                    const showCommentEdit = showLeftCommentEdit || showRightCommentEdit;
                    const showCommentLine = comments || showCommentEdit;
                    let toggleEditFn = toggleLeftCommentEdit;
                    if (oldLineNo < 0) {
                      toggleEditFn = toggleRightCommentEdit;
                    }

                    return (
                      <React.Fragment key={`${lineKey}_${lineIndex}`}>
                        <tr
                          className={`${lineCls} ${selected ? 'selected' : ''}`}
                          onMouseEnter={() => handleMouseEnter(lineIndex, i, lineKey)}
                        >
                          {/* <td className={lineIssue ? 'issue-td' : 'none-issue-td'}>
                                {lineIssue ? <Icon className="issue-icon" type="exclamation-circle" /> : null}
                              </td> */}
                          <td
                            className={`diff-line-num old-line ${unfoldClassName}`}
                            onClick={handleExpand}
                            data-prefix={oldPrefix}
                          >
                            <IF
                              check={
                                !isCommentEditVisible && actionType && (showLeftCommentIcon || showRightCommentIcon)
                              }
                            >
                              <div
                                onMouseDown={() => handleMouseDown(i, lineIndex)}
                                onMouseUp={() => {
                                  setIsMouseDown(false);
                                }}
                              >
                                <CommentIcon onClick={() => toggleLeftCommentEdit(lineKey, true)} />
                              </div>
                            </IF>
                          </td>
                          <td
                            className={`diff-line-num new-line ${unfoldClassName}`}
                            onClick={handleExpand}
                            data-prefix={newPrefix}
                          />
                          <td className="diff-line-content" data-prefix={actionPrefix}>
                            <pre>
                              <code style={codeStyle}>{_content}</code>
                            </pre>
                          </td>
                        </tr>
                        <IF check={showCommentLine}>
                          <tr>
                            <td colSpan={2} />
                            <td className="comment-box-td">
                              <CommentListBox comments={comments} />
                              {actionType ? (
                                <IF check={showCommentEdit}>
                                  <IF check={!comments?.length}>
                                    <div className="mb-2 text-base">
                                      {i18n.t('comment')}
                                      {i18n.t('line')}{' '}
                                      {endRowIndex === 0
                                        ? getSingleLineIndex(startLine?.oldLineNo, startLine?.newLineNo)
                                        : i18n.t(
                                            'from {start} to {end}',
                                            getTwoLineIndex(
                                              startLine?.oldLineNo,
                                              startLine?.newLineNo,
                                              endLine?.oldLineNo,
                                              endLine?.newLineNo,
                                            ),
                                          )}
                                    </div>
                                  </IF>
                                  <CommentEditBox
                                    markdownValue={isShowLS[lineKey] ? tsComment.content : null}
                                    onPostComment={(v) => {
                                      addCommentFn({
                                        note: v,
                                      }).then(() => {
                                        toggleLeftCommentEdit(lineKey, false);
                                        toggleRightCommentEdit(lineKey, false);
                                      });
                                    }}
                                    onCancel={() => {
                                      toggleLeftCommentEdit(lineKey, false);
                                      toggleRightCommentEdit(lineKey, false);
                                    }}
                                    onStartAI={() => {
                                      return addCommentFn({
                                        startAISession: true,
                                        aiCodeReviewType: 'MR_CODE_SNIPPET',
                                      }).then(() => {
                                        toggleLeftCommentEdit(lineKey, false);
                                        toggleRightCommentEdit(lineKey, false);
                                      });
                                    }}
                                  />
                                  <ELSE />
                                  <IF check={!(comments?.length && comments[comments.length - 1].data.aiSessionID)}>
                                    <Button onClick={() => toggleEditFn(lineKey, true)}>{i18n.t('dop:reply')}</Button>
                                  </IF>
                                </IF>
                              ) : (
                                ''
                              )}
                            </td>
                          </tr>
                        </IF>
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={`${lineKey}`}>
                      <tr
                        className={`${lineCls} ${selected ? 'selected' : ''}`}
                        onMouseEnter={() => handleMouseEnter(lineIndex, i, lineKey)}
                      >
                        {/* <td data-prefix={oldPrefix} className={lineIssue ? 'issue-td' : 'none-issue-td'}>
                              {lineIssue ? <Icon className="issue-icon" type="exclamation-circle" /> : null}
                            </td> */}
                        <td
                          className={`diff-line-num old-line ${unfoldClassName}`}
                          onClick={handleExpand}
                          data-prefix={oldPrefix}
                        >
                          <IF check={!isCommentEditVisible && showLeftCommentIcon}>
                            <div
                              onMouseDown={() => handleMouseDown(i, lineIndex)}
                              onMouseUp={() => {
                                setIsMouseDown(false);
                              }}
                            >
                              <CommentIcon onClick={() => toggleLeftCommentEdit(lineKey, true)} />
                            </div>
                          </IF>
                        </td>
                        <td className="diff-line-content" data-prefix={leftContent === '' ? '' : actionPrefix}>
                          <pre>
                            <code style={codeStyle}>{leftContent}</code>
                          </pre>
                        </td>
                        <td
                          className={`diff-line-num new-line ${unfoldClassName}`}
                          onClick={handleExpand}
                          data-prefix={newPrefix}
                        >
                          <IF check={!isCommentEditVisible && showRightCommentIcon}>
                            <div
                              onMouseDown={() => handleMouseDown(i, lineIndex)}
                              onMouseUp={() => {
                                setIsMouseDown(false);
                              }}
                            >
                              <CommentIcon onClick={() => toggleRightCommentEdit(lineKey, true)} />
                            </div>
                          </IF>
                        </td>
                        <td className="diff-line-content" data-prefix={rightContent === '' ? '' : actionPrefix}>
                          <pre>
                            <code style={codeStyle}>{rightContent}</code>
                          </pre>
                        </td>
                      </tr>
                      <IF check={showLeftCommentLine || showRightCommentLine}>
                        <tr>
                          <td />
                          <td className="comment-box-td">
                            <IF check={oldLineNo > 0}>
                              <CommentListBox comments={comments} />
                              <IF
                                check={
                                  comments &&
                                  !showLeftCommentEdit &&
                                  !(comments?.length && comments[comments.length - 1].data.aiSessionID)
                                }
                              >
                                <Button onClick={() => toggleLeftCommentEdit(lineKey, true)}>
                                  {i18n.t('dop:reply')}
                                </Button>
                              </IF>
                            </IF>
                            <IF check={showLeftCommentEdit}>
                              <IF check={!comments?.length}>
                                <div className="mb-2 text-base">
                                  {i18n.t('comment')}
                                  {i18n.t('line')}{' '}
                                  {endRowIndex === 0
                                    ? getSingleLineIndex(startLine?.oldLineNo, startLine?.newLineNo)
                                    : i18n.t(
                                        'from {start} to {end}',
                                        getTwoLineIndex(
                                          startLine?.oldLineNo,
                                          startLine?.newLineNo,
                                          endLine?.oldLineNo,
                                          endLine?.newLineNo,
                                        ),
                                      )}
                                </div>
                              </IF>

                              <CommentEditBox
                                markdownValue={isShowLS[lineKey] ? tsComment.content : null}
                                onPostComment={(v) => {
                                  addCommentFn({
                                    note: v,
                                  }).then(() => {
                                    toggleLeftCommentEdit(lineKey, false);
                                    toggleRightCommentEdit(lineKey, false);
                                  });
                                }}
                                onCancel={() => {
                                  toggleLeftCommentEdit(lineKey, false);
                                  toggleRightCommentEdit(lineKey, false);
                                }}
                                onStartAI={() => {
                                  return addCommentFn({
                                    startAISession: true,
                                    aiCodeReviewType: 'MR_CODE_SNIPPET',
                                  }).then(() => {
                                    toggleLeftCommentEdit(lineKey, false);
                                    toggleRightCommentEdit(lineKey, false);
                                  });
                                }}
                              />
                            </IF>
                          </td>
                          <td />
                          <td className="comment-box-td">
                            <IF check={newLineNo > 0}>
                              <CommentListBox comments={comments} />
                              <IF
                                check={
                                  comments &&
                                  !showRightCommentEdit &&
                                  !(comments?.length && comments[comments.length - 1].data.aiSessionID)
                                }
                              >
                                <Button onClick={() => toggleRightCommentEdit(lineKey, true)}>
                                  {i18n.t('dop:reply')}
                                </Button>
                              </IF>
                            </IF>
                            <IF check={showRightCommentEdit}>
                              <IF check={!comments?.length}>
                                <div className="mb-2 text-base">
                                  {i18n.t('comment')}
                                  {i18n.t('line')}{' '}
                                  {endRowIndex === 0
                                    ? startLineKey
                                    : i18n.t('from {start} to {end}', { start: startLineKey, end: endLineKey })}
                                </div>
                              </IF>
                              <CommentEditBox
                                markdownValue={isShowLS[lineKey] ? tsComment.content : null}
                                onPostComment={(v) => {
                                  addCommentFn({
                                    note: v,
                                  }).then(() => {
                                    toggleLeftCommentEdit(lineKey, false);
                                    toggleRightCommentEdit(lineKey, false);
                                  });
                                }}
                                onCancel={() => {
                                  toggleLeftCommentEdit(lineKey, false);
                                  toggleRightCommentEdit(lineKey, false);
                                }}
                                onStartAI={() => {
                                  return addCommentFn({
                                    startAISession: true,
                                    aiCodeReviewType: 'MR_CODE_SNIPPET',
                                  }).then(() => {
                                    toggleLeftCommentEdit(lineKey, false);
                                    toggleRightCommentEdit(lineKey, false);
                                  });
                                }}
                              />
                            </IF>
                          </td>
                        </tr>
                      </IF>
                    </React.Fragment>
                  );
                })}
              </tbody>
            );
          })}
        </table>
      </IF>
    </div>
  );
};

const FileDiffWithRef = React.forwardRef((props: any, ref: any) => <FileDiff {...props} forwardRef={ref} />) as any;

interface IDiff {
  files: REPOSITORY.IFile[];
  filesChanged: boolean;
  totalAddition: number;
  totalDeletion: number;
}

interface IDiffProps {
  mode: any;
  diff: IDiff;
  from: string;
  to: string;
  comments: REPOSITORY.IComment[];
  disableComment?: boolean;
}
const FilesDiff = (props: IDiffProps) => {
  const [showStyle, setShowStyle] = React.useState('inline');
  const [expandDiffFiles, setExpandDiffFiles] = React.useState(false);
  const [diffFileRefs, setDiffFileRefs] = React.useState({});
  const { getBlobRange, addComment: addCommentFunc, getComments } = repoStore.effects;
  const [renderList, setRenderList] = React.useState([] as REPOSITORY.IFile[]);
  const appDetail = appStore.useStore((s) => s.detail);
  const [visible, setVisible] = useState(false);
  const [currentfile, setCurrentFile] = useState<{ name: string; oldName: string }>();
  const { mergeId } = routeInfoStore.useStore((s) => s.params);
  const mrDetail = repoStore.useStore((s) => s.mrDetail);
  const { state } = mrDetail;
  const [reviewFileName, setReviewFileName] = React.useState('');
  const [reviewLoading, setReviewLoading] = React.useState(false);

  React.useEffect(() => {
    if (props.diff) {
      const { files } = props.diff;
      const refs = {};
      (files || []).forEach((file: any) => {
        refs[file.name] = React.createRef();
      });
      setDiffFileRefs(refs);
    }
  }, [props.diff]);

  const showToggle = (e: any) => {
    setShowStyle(e.target.value);
  };

  const addComment = (data: object) => {
    const { from, to } = props;
    return addCommentFunc({
      oldCommitId: to,
      newCommitId: from,
      ...data,
    });
  };

  const onToggleDiffFiles = () => {
    setExpandDiffFiles(!expandDiffFiles);
  };

  const navigateToFile = (fileName: string) => {
    const ref = diffFileRefs[fileName];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    } else {
      const target = document.querySelector('#main');
      const frameFunc = () => {
        target && (target.scrollTop += 500);
        if (!diffFileRefs[fileName].current) {
          window.requestAnimationFrame(frameFunc);
        } else {
          diffFileRefs[fileName].current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      };
      window.requestAnimationFrame(frameFunc);
    }
  };

  const { diff, comments, disableComment } = props;

  const renderDiffFiles = React.useCallback(
    (leftCount: number) => {
      window.requestIdleCallback(() => {
        const oneTimeCount = leftCount >= 10 ? 10 : leftCount; // 每次渲染10个文件
        const newList = renderList.concat(diff.files.slice(renderList.length, renderList.length + oneTimeCount));
        setRenderList(newList);
      });
    },
    [diff, renderList],
  );

  React.useEffect(() => {
    if (diff && diff.files && renderList.length < diff.files.length) {
      renderDiffFiles(diff.files.length - renderList.length);
    }
  }, [diff, diff.files, renderDiffFiles, renderList]);

  if (!diff || !diff.files) {
    return <EmptyListHolder />;
  }
  const { filesChanged, totalAddition, totalDeletion } = diff;

  const fileCommentMap = getFileCommentMap(comments);

  const reviewFile = async () => {
    if (currentfile?.name) {
      setReviewLoading(true);

      const params = {
        type: 'diff_note',
        oldPath: currentfile.oldName,
        newPath: currentfile.name,
        startAISession: true,
        aiCodeReviewType: 'MR_FILE',
        oldLine: 0,
        newLine: 0,
        oldLineTo: 0,
        newLineTo: 0,
      };

      await addComment(params);
      message.success(i18n.t('{action} successfully', { action: i18n.t('review') }));
      setReviewLoading(false);
    }
  };

  const reviewCommentMap = fileCommentMap[reviewFileName] || {};
  const reviewComment = reviewCommentMap['0_0']?.[0]?.note;

  return (
    <div>
      <BackToTop />
      <div className={expandDiffFiles ? 'commit-summary-expand' : 'commit-summary-hide'}>
        <div className="commit-summary">
          <div>
            <span>
              {i18n.t('dop:share')}
              <span className="changed-count ml-2">
                {filesChanged} {i18n.t('dop:changed file(s)')}
              </span>
              <Tooltip title={expandDiffFiles ? i18n.t('dop:collapse file') : i18n.t('dop:expand file')}>
                <span className="ml-2 cursor-pointer df-icon" onClick={onToggleDiffFiles}>
                  {expandDiffFiles ? <CustomIcon type="sq" /> : <CustomIcon type="zk" />}
                </span>
              </Tooltip>
              <span className="add-count ml-2">
                {totalAddition} {i18n.t('dop:additions')}
              </span>
              <span className="del-count ml-2">
                {totalDeletion} {i18n.t('dop:deletions')}
              </span>
            </span>
          </div>
          <div className="toggle-view-btn">
            <RadioGroup onChange={showToggle} defaultValue={showStyle}>
              <RadioButton value="inline">{i18n.t('dop:single line')}</RadioButton>
              <RadioButton value="sideBySide">{i18n.t('dop:side-by-side')}</RadioButton>
            </RadioGroup>
          </div>
        </div>
        <div className="diff-file-list">
          {map(diff.files, (file) => (
            <div key={file.name} className="diff-file cursor-pointer" onClick={() => navigateToFile(file.name)}>
              <div className="diff-count">
                <span className="diff-add-icon">+{file.addition}</span>
                <span className="diff-del-icon">-{file.deletion}</span>
              </div>
              <div className="diff-file-path nowrap">{file.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="file-diff-list">
        {renderList.map((file: REPOSITORY.IFile) => {
          const commentMap = fileCommentMap[file.name] || {};
          let ref = null;
          if (!isEmpty(diffFileRefs)) {
            ref = diffFileRefs[file.name];
          }
          return (
            <FileDiffWithRef
              key={file.name}
              file={file}
              commentMap={commentMap}
              getBlobRange={getBlobRange}
              showStyle={showStyle}
              disableComment={disableComment}
              addComment={addComment}
              mode={props.mode}
              ref={ref}
              appDetail={appDetail}
              titleSlot={
                mergeId ? (
                  <Button
                    className="ml-4"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisible(true);
                      setCurrentFile(file);
                      setReviewFileName(file.name);
                    }}
                  >
                    {i18n.t('AI review')}
                  </Button>
                ) : (
                  ''
                )
              }
            />
          );
        })}
      </div>
      <Modal
        width="60%"
        title={`${currentfile?.name ? `${currentfile.name}` : ''} ${i18n.t('AI review')}`}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        bodyStyle={{ height: '80vh', overflowY: 'auto' }}
      >
        <div>
          <Spin spinning={reviewLoading}>
            {reviewComment ? <MarkdownRender value={reviewComment} /> : <Empty />}
            <div className="text-center mt-4">
              <Button disabled={state !== 'open'} onClick={reviewFile}>
                {reviewComment ? i18n.t('re-examine') : i18n.t('review')}
              </Button>
            </div>
          </Spin>
        </div>
      </Modal>
    </div>
  );
};

interface CommentEditBoxProps {
  markdownValue: string;
  onPostComment: (v: string) => void;
  onCancel: () => void;
  onStartAI: () => Promise<any>;
}

const CommentEditBox = ({ markdownValue, onPostComment, onCancel, onStartAI }: CommentEditBoxProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Spin spinning={loading}>
        <MarkdownEditor
          value={markdownValue}
          operationBtns={[
            {
              text: i18n.t('dop:post comment'),
              type: 'primary',
              onClick: onPostComment,
            },
            {
              text: i18n.t('AI dialogue'),
              type: 'primary',
              onClick: async () => {
                setLoading(true);
                await onStartAI();
                setLoading(false);
              },
            },
            {
              text: i18n.t('Cancel'),
              onClick: () => onCancel(),
            },
          ]}
        />
      </Spin>
    </div>
  );
};

const getSingleLineIndex = (oldLine: number, newLine: number) => {
  return oldLine !== -1 ? `-${oldLine}` : `+${newLine}`;
};

const getTwoLineIndex = (oldLine: number, newLine: number, oldLineTo: number, newLineTo: number) => {
  return {
    start: oldLine !== -1 ? `-${oldLine}` : `+${newLine}`,
    end: oldLineTo !== -1 ? `-${oldLineTo}` : `+${newLineTo}`,
  };
};

export default FilesDiff;
