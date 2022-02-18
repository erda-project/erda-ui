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

import { Button, Drawer, Select, Spin, Tabs } from 'antd';
import { getIssues as getProjectIssues } from 'app/modules/project/services/issue';
import { getProjectList } from 'app/modules/project/services/project';
import { CommentBox } from 'application/common/components/comment-box';
import { ProblemPriority, ProblemTypeOptions } from 'application/pages/problem/problem-form';
import { closeTicket, createTicketComments, getTicketComments, getTicketDetail } from 'application/services/problem';
import { Avatar, LoadMoreSelector, MarkdownRender, Ellipsis } from 'common';
import MarkdownEditor from 'common/components/markdown-editor';
import { useUpdate } from 'common/use-hooks';
import { fromNow, goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import { useUserMap } from 'core/stores/userMap';
import i18n from 'i18n';
import { isEmpty, map, toLower } from 'lodash';
import { getProjectIterations } from 'project/services/project-iteration';
import React from 'react';
import userStore from 'user/stores';
import { getUserInfo } from './problem-list';
import './problem-detail.scss';

interface IProps {
  detail: PROBLEM.Ticket;
}

export const ProblemContent = ({ detail }: IProps) => {
  const { label, type, content, author, createdAt } = detail;
  const params = routeInfoStore.useStore((s) => s.params);

  const getUrl = (path: string, ticket: PROBLEM.Ticket) => {
    const { projectId, appId, orgName } = params;

    return `/${orgName}/workBench/projects/${projectId}/apps/${appId}/repo/tree/${ticket.label.branch}/${path}?qa=${ticket.type}&line=${ticket.label.line}`;
  };

  const getNote = () => {
    let note = '';

    let url;
    let linkLabel = label && label.path;
    if (linkLabel) {
      if (linkLabel.includes('/src/')) {
        linkLabel = `/src${linkLabel.split('src').pop()}`;
      } else {
        linkLabel = linkLabel.split('/').pop() || '';
      }
    }
    switch (type) {
      case 'bug':
      case 'vulnerability':
      case 'codeSmell':
        url = !isEmpty(label) ? getUrl(label.path, detail) : null;
        note = label?.path
          ? `${label.code}\n
${i18n.t('dop:jump to code')}：[${linkLabel || label.path}](${url})`
          : content;
        break;
      default:
        note = content;
        break;
    }

    return note;
  };

  let _note = getNote();
  let _content;
  if (label && label.lineCode) {
    _note = _note.replace(label.lineCode, `$t_start${label.lineCode}$t_end`);
    _content = MarkdownRender.toHtml(_note || '');
    _content = _content.replace('$t_start', '<div class="error">').replace('$t_end', '</div>');
  } else {
    _content = MarkdownRender.toHtml(_note || '');
  }

  return <CommentBox user={author} time={createdAt} action={i18n.t('dop:built in')} content={_content} html />;
};

const { TabPane } = Tabs;
const { Option } = Select;

const initialState = {
  detail: null,
  loadingDetail: false,
  comments: [] as PROBLEM.Comment[],
  loadingComments: false,
  activeProject: undefined,
  activeIteration: undefined,
  activeIssueType: undefined,
  activeIssue: undefined,
  activeIssueTitle: undefined,
};

const TicketDetail = ({ id, onClose, onCloseIssue }: { id: number; onClose: () => void; onCloseIssue: () => void }) => {
  const [{ activeProject, activeIteration, activeIssueType, activeIssue, activeIssueTitle }, , update] =
    useUpdate(initialState);
  const userMap = useUserMap();
  const loginUser = userStore.useStore((s) => s.loginUser);
  const detail = getTicketDetail.useData();
  const commentsData = getTicketComments.useData();
  const mdRef = React.useRef(null);

  React.useEffect(() => {
    if (id) {
      getTicketDetail.fetch({ ticketId: id });
      getTicketComments.fetch({ ticketID: id });
    }
  }, [id, update]);

  if (!detail) return null;

  const handleSubmit = (content: string) => {
    if (!content) {
      return;
    }

    createTicketComments({
      ticketID: detail.id,
      userID: loginUser.id,
      content,
      commentType: 'normal',
    }).then((res) => {
      if (res.success) {
        getTicketComments.fetch({ ticketID: detail.id });
        mdRef.current?.clear();
      }
    });
  };

  const type = ProblemTypeOptions.find((t) => t.value === detail.type);
  const priority = ProblemPriority.find((t: any) => t.value === detail.priority);

  const getProjects = (q: any) => {
    return getProjectList({ ...q }).then((res: any) => res.data);
  };

  const getIterations = (q: any) => {
    if (!activeProject) return;
    return getProjectIterations({ ...q }).then((res: any) => res.data);
  };

  const getIssues = (q: any) => {
    if (!(activeProject && activeIteration && activeIssueType)) return;
    return getProjectIssues({ ...q }).then((res: any) => res.data);
  };

  const handleAssociationIssue = () => {
    createTicketComments({
      ticketID: detail.id,
      userID: loginUser.id,
      commentType: 'issueRelation',
      irComment: {
        issueID: activeIssue || 0,
        issueTitle: activeIssueTitle || '',
        projectID: activeProject || 0,
        iterationID: activeIteration || 0,
        issueType: toLower(activeIssueType) || '',
      },
    });
  };
  return (
    <Drawer
      width="70%"
      visible={!!id}
      title={
        <div className="flex items-center pr-4">
          <Ellipsis title={detail.title} />
          <span className={`ml-1 ${priority?.color}`}>{priority?.name || '-'}</span>
        </div>
      }
      onClose={() => onClose()}
    >
      <div className="h-full">
        <div className="mb-5">
          <span className="mr-5">
            <span className="detail-property">{i18n.t('type')}: </span>
            <span className="detail-value">{type ? type.name : '-'}</span>
          </span>
        </div>
        <div className="comments-container pb-16">
          <ProblemContent detail={detail} />
          <div className="mt-3">
            {(commentsData?.comments || []).map((comment) => {
              const user = getUserInfo(userMap, comment.userID);
              return comment.commentType === 'issueRelation' ? (
                <div className="comments-association-box">
                  <Avatar name={user} showName size={28} />
                  <span className="mx-1">{i18n.t('at')}</span>
                  <span className="mx-1">{fromNow(comment.createdAt)}</span>
                  <span className="mx-1">{i18n.t('dop:associated issue')}</span>
                  <span
                    className="text-link"
                    onClick={() => {
                      let page = '';
                      const { issueType, projectID, issueID } = comment.irComment;
                      switch (issueType) {
                        case 'task':
                          page = goTo.pages.taskList;
                          break;
                        case 'bug':
                          page = goTo.pages.bugList;
                          break;
                        default:
                          break;
                      }
                      goTo(page, { projectId: projectID, taskId: issueID, jumpOut: true });
                    }}
                  >
                    {comment.irComment.issueTitle}
                  </span>
                </div>
              ) : (
                <CommentBox
                  className="mb-4"
                  key={comment.id}
                  user={user}
                  time={comment.createdAt}
                  action={i18n.t('dop:commented at')}
                  content={comment.content}
                />
              );
            })}
          </div>
          <Tabs>
            <TabPane tab={i18n.t('comment')} key="comment">
              <MarkdownEditor
                ref={mdRef}
                maxLength={5000}
                operationBtns={[
                  {
                    text: i18n.t('dop:submit comments'),
                    type: 'primary',
                    onClick: (v) => handleSubmit(v),
                  },
                ]}
              />
            </TabPane>
            <TabPane tab={i18n.t('relate to issue')} key="relate">
              <div className="flex justify-between items-center">
                <div className="flex items-center justify-start flex-1">
                  <LoadMoreSelector
                    className="selector-item"
                    value={activeProject}
                    getData={getProjects}
                    placeholder={i18n.t('dop:please select project')}
                    dataFormatter={({ list, total }: { list: any[]; total: number }) => ({
                      total,
                      list: map(list, (project) => {
                        const { name, id } = project;
                        return {
                          ...project,
                          label: name,
                          value: id,
                        };
                      }),
                    })}
                    onChange={(val) => {
                      update({
                        ...initialState,
                        activeProject: val as any,
                      });
                    }}
                  />
                  <LoadMoreSelector
                    className="selector-item"
                    value={activeIteration}
                    getData={getIterations}
                    extraQuery={{ projectID: activeProject }}
                    showSearch={false}
                    placeholder={i18n.t('dop:please select iteration')}
                    onChange={(val) => {
                      update({
                        activeIteration: val as any,
                        activeIssueType: undefined,
                        activeIssue: undefined,
                        activeIssueTitle: undefined,
                      });
                    }}
                    dataFormatter={({ list, total }: { list: any[]; total: number }) => ({
                      total,
                      list: map(list, (iteration) => {
                        const { title, id } = iteration;
                        return {
                          ...iteration,
                          label: title,
                          value: id,
                        };
                      }),
                    })}
                  />
                  <Select
                    className="selector-item"
                    placeholder={i18n.t('dop:please select issue type')}
                    value={activeIssueType}
                    onSelect={(val) => {
                      update({
                        activeIssueType: val as any,
                        activeIssue: undefined,
                        activeIssueTitle: undefined,
                      });
                    }}
                  >
                    <Option value="TASK">{i18n.t('task')}</Option>
                    <Option value="BUG">{i18n.t('bug')}</Option>
                  </Select>
                  <LoadMoreSelector
                    className="selector-item"
                    value={activeIssue}
                    getData={getIssues}
                    extraQuery={{ projectID: activeProject, iterationID: activeIteration, type: activeIssueType }}
                    showSearch={false}
                    placeholder={i18n.t('dop:please select issue')}
                    dataFormatter={({ list, total }: { list: any[]; total: number }) => ({
                      total,
                      list: map(list, (issue) => {
                        const { title, id } = issue;
                        return {
                          ...issue,
                          label: title,
                          value: id,
                        };
                      }),
                    })}
                    onChange={(val, opts) => {
                      update({
                        activeIssue: val as any,
                        activeIssueTitle: opts.title as any,
                      });
                    }}
                  />
                </div>
                <div className="options-wrap">
                  <Button className="mr-2" type="primary" disabled={!activeIssue} onClick={handleAssociationIssue}>
                    {i18n.t('association')}
                  </Button>
                  <Button onClick={() => update(initialState)}>{i18n.t('reset')}</Button>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>

        {detail.status === 'open' && (
          <div className="absolute bottom-0 right-0 left-0 py-3 px-4 bg-white ">
            <Button type="primary" onClick={() => closeTicket({ ticketId: detail.id }).then(() => onCloseIssue())}>
              {i18n.t('dop:close issue')}
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default TicketDetail;
