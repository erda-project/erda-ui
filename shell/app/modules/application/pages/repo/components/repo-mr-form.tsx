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

import { Button, Menu, Dropdown, message, Tooltip, Avatar } from 'antd';
import React from 'react';
import { RenderForm, FormModal, MemberSelector, ErdaIcon, MarkdownRender, Table } from 'common';
import { connectCube, goTo, getAvatarChars } from 'common/utils';
import MarkdownEditor from 'common/components/markdown-editor';
import SourceTargetSelect from './source-target-select';
import i18n from 'i18n';
import { useUpdate } from 'common/use-hooks';
import { Link } from 'react-router-dom';
import { connectUser } from 'app/user/common';
import { useEffectOnce } from 'react-use';
import { isEmpty, find } from 'lodash';
import repoStore from 'application/stores/repo';
import { useUserMap } from 'core/stores/userMap';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import { ISSUE_TYPE, ISSUE_PRIORITY_MAP } from 'project/common/components/issue/issue-config';
import { FormInstance, ColumnProps } from 'core/common/interface';
import { AddIssueRelation } from 'project/common/components/issue/issue-relation';
import './repo-mr-form.scss';
import routeInfoStore from 'core/stores/route';
import IssueState from 'project/common/components/issue/issue-state';
import layoutStore from 'layout/stores/layout';
import { batchCreatCommentStream } from 'project/services/issue';
import userStore from 'app/user/stores';
import moment from 'moment';

interface IModel {
  visible: boolean;
  tplContent: string;
  templateConfig: {
    path: string;
    names: string[];
  };
  onOk: (data: object) => void;
  onCancel: () => void;
}
const TplModel = ({ visible, tplContent, templateConfig, onOk, onCancel }: IModel) => {
  const { path } = templateConfig;

  const fieldsList = [
    {
      label: i18n.t('template name'),
      name: 'name',
      itemProps: {
        maxLength: 20,
        addonAfter: '.md',
      },
      rules: [
        {
          validator: (_rule: any, value: string, callback: Function) => {
            const duplicate = templateConfig.names.includes(`${value}.md`);
            if (duplicate) {
              callback(i18n.t('template already exists'));
            } else {
              callback();
            }
          },
        },
      ],
      extraProps: {
        extra: (
          <span>
            {i18n.t('file saving directory')}: <code className="mr-template-save-path">{path}</code>
          </span>
        ),
      },
    },
    {
      label: i18n.t('template preview'),
      name: 'content',
      required: false,
      initialValue: tplContent,
      getComp() {
        return <MarkdownRender className="mr-template-preview" value={tplContent || ''} />;
      },
    },
  ];
  return (
    <FormModal
      width="620px"
      title={i18n.t('create template')}
      layout="vertical"
      fieldsList={fieldsList}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    />
  );
};

interface IBranchObj {
  sourceBranch: string;
  targetBranch: string;
  removeSourceBranch: boolean;
}

interface IProps {
  sideFold: boolean;
  info: REPOSITORY.IInfo;
  params: Obj<string>;
  templateConfig: {
    names: [];
    branch: string;
    path: string;
  };
  mrStats: REPOSITORY.IMrStats;
  children: React.ReactElement;
  formData: Obj;
  operateMR: typeof repoStore.effects.operateMR;
  getRepoBlob: typeof repoStore.effects.getRepoBlob;
  getMRStats: typeof repoStore.effects.getMRStats;
  getCompareDetail: typeof repoStore.effects.getCompareDetail;
  createMR: typeof repoStore.effects.createMR;
  getRepoInfo: typeof repoStore.effects.getRepoInfo;
  clearMRStats: typeof repoStore.reducers.clearMRStats;
  commit: typeof repoStore.effects.commit;
  onBranchChange: (b: IBranchObj) => void;
  onShowComparison: () => Promise<any>;
  onCancel: () => void;
  onOk: (data: Obj) => void;
  getTemplateConfig: () => Promise<any>;
  moveToDiff: () => void;
}

const tplMap: Obj<string> = {};
let tplNameCache = '';
const RepoMRForm = (props: IProps) => {
  const {
    templateConfig,
    formData,
    mrStats,
    info,
    params: { appId },
    sideFold,
    createMR,
    operateMR,
    getRepoInfo,
    onOk,
    commit,
    getTemplateConfig,
    clearMRStats,
    onBranchChange: propsOnBranchChange,
    getMRStats: propsGetMRStats,
    onCancel: propsOnCancel,
    getCompareDetail,
    onShowComparison,
    getRepoBlob,
    moveToDiff,
    children = null,
  } = props;
  const [state, updater, update] = useUpdate({
    tplName: '',
    tplContent: '',
    tplModelVisible: false,
  });

  const loginUser = userStore.useStore((s) => s.loginUser);
  const { tplModelVisible, tplContent, tplName } = state;
  const form = React.useRef<FormInstance>();
  const issueRef = React.useRef<{ getChosenIssues: () => ISSUE.IssueType[] }>();

  const isEdit = !!formData;

  useEffectOnce(() => {
    if (!isEmpty(formData)) {
      const { sourceBranch, targetBranch, removeSourceBranch } = formData;
      getMRStats({ sourceBranch, targetBranch, removeSourceBranch });
    }
    getTemplateConfig().then((config) => {
      if (config.names.length) {
        selectTemplate(config.names[0]);
      }
    });
    return () => {
      clearMRStats();
    };
  });

  const onBranchChange = (branch: IBranchObj, isBranchChange: boolean) => {
    if (isBranchChange) {
      propsOnBranchChange?.(branch);
      getMRStats(branch);
    }
  };

  const getMRStats = (branch: IBranchObj) => {
    const { sourceBranch, targetBranch } = branch;
    if (sourceBranch) {
      propsGetMRStats({
        sourceBranch: sourceBranch || info.defaultBranch,
        targetBranch,
      });
    }
  };

  const onCancel = () => {
    form.current?.resetFields();
    clearMRStats();
    propsOnCancel();
  };

  const onCompare = ({ sourceBranch, targetBranch }: IBranchObj) => {
    getCompareDetail({ compareA: sourceBranch, compareB: targetBranch });
    onShowComparison?.();
  };

  const selectTemplate = (name: string) => {
    const { branch, path } = templateConfig;
    if (tplMap[name]) {
      handleTplChange({
        tplName: name,
        tplContent: tplMap[name],
      });
      return;
    }
    getRepoBlob({ path: `/${branch}/${path}/${name}` }).then((data) => {
      update({
        tplName: name,
        tplContent: data.content,
      });
      tplMap[name] = data.content;
      tplNameCache = name;
    });
  };

  const handleTplChange = (params: { tplContent: string; tplName: string }) => {
    form.current?.setFieldsValue({ description: params.tplContent });
    update({ tplContent: params.tplContent, tplName: params.tplName });
  };

  const toggleTplModel = (visible: boolean) => {
    update({ tplModelVisible: visible });
  };

  const getTplSelect = () => {
    const tplNames = templateConfig.names.filter((file: string) => file.endsWith('.md'));

    const menu = (
      <Menu selectedKeys={[`tpl_${tplName}`]}>
        {tplNames.length ? (
          tplNames.map((name: string) => {
            return (
              <Menu.Item key={`tpl_${name}`} onClick={() => selectTemplate(name)}>
                {name.replace('.md', '')}
              </Menu.Item>
            );
          })
        ) : (
          <Menu.Item key="empty" disabled>
            {i18n.t('no template')}
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item key="clear" onClick={() => handleTplChange({ tplContent: '', tplName: '' })}>
          {i18n.t('clear content')}
        </Menu.Item>
        {/* <Menu.Item key="save" disabled={!this.state.tplContent} onClick={() => this.toggleTplModel(true)}>
          保存为模板
        </Menu.Item> */}
        <Menu.Item
          key="reset"
          disabled={!tplName || !tplNames.length}
          onClick={() =>
            handleTplChange({
              tplName: tplName || tplNameCache,
              tplContent: tplMap[tplName || tplNameCache],
            })
          }
        >
          {i18n.t('recover template')}
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu}>
        <span className="inline-flex items-center text-xs mr-2 cursor-pointer">
          {tplName ? `${i18n.t('selected template')}:${tplName.replace('.md', '')}` : i18n.t('select template')}{' '}
          <ErdaIcon type="down" size="16" />
        </span>
      </Dropdown>
    );
  };

  const getFieldsList = () => {
    const { sourceBranch, targetBranch, removeSourceBranch, title, description, assigneeId } = (formData || {}) as any;

    const fieldExtraProps = {
      style: {
        marginBottom: '16px',
      },
    };
    const fieldsList = [
      {
        label: '',
        getComp: () => <div className="section-title">{i18n.t('dop:choose branch')}</div>,
        extraProps: fieldExtraProps,
      },
      {
        label: '',
        formItemLayout: { labelCol: { span: 0 }, wrapperCol: { span: 18, offset: 3 } },
        name: 'branch',
        getComp: () => (
          <SourceTargetSelect
            mrStats={mrStats}
            defaultSourceBranch={sourceBranch}
            defaultTargetBranch={targetBranch || info.defaultBranch}
            defaultRemoveSourceBranch={removeSourceBranch}
            disableSourceBranch={!!formData}
            onChange={onBranchChange}
            onCompare={onCompare}
            branches={info.branches || []}
            moveToDiff={moveToDiff}
          />
        ),
        rules: [
          {
            validator: (_rule: any, value: any, callback: Function) => {
              if (!value || !value.sourceBranch) {
                callback(i18n.t('dop:no comparison branch selected'));
                return;
              }
              callback();
            },
          },
        ],
        extraProps: fieldExtraProps,
      },
      {
        label: '',
        getComp: () => <div className="section-title">{i18n.t('basic information')}</div>,
        extraProps: {
          style: {
            marginTop: '32px',
            marginBottom: '0',
          },
        },
      },
      {
        label: i18n.t('title'),
        name: 'title',
        initialValue: title || '',
        itemProps: {
          maxLength: 200,
        },
        extraProps: fieldExtraProps,
      },
      {
        label: i18n.t('description'),
        name: 'description',
        initialValue: description || tplContent || '',
        getComp: () => (
          <MarkdownEditor onChange={(content) => update({ tplContent: content })} extraRight={getTplSelect()} />
        ),
        extraProps: fieldExtraProps,
      },
      {
        label: i18n.t('designated person'),
        name: 'assigneeId',
        initialValue: assigneeId,
        className: 'repo-mr-form-assignee',
        getComp: () => {
          return <MemberSelector className="w-full" scopeId={appId} scopeType="app" showSelfChosen />;
        },
        extraProps: fieldExtraProps,
      },
    ];
    return fieldsList;
  };

  const createTemplate = (values: any) => {
    const { branch, path } = templateConfig;
    commit({
      message: `Add merge request template: ${values.name}`,
      branch,
      actions: [
        {
          action: 'add',
          content: tplContent,
          path: `${path}/${values.name}.md`,
          pathType: 'blob',
        },
      ],
    }).then((res: any) => {
      if (res.success) {
        message.success(i18n.t('template was created successfully'));
        toggleTplModel(false);
        getTemplateConfig();
      }
    });
  };

  const handleSubmit = (_form: FormInstance) => {
    _form.validateFields().then((values: any) => {
      const { branch, ...rest } = values;
      const { sourceBranch, targetBranch, removeSourceBranch } = branch;
      // 源分支为默认分支时禁止删除
      const sourceIsDefaultBranch = info.defaultBranch === sourceBranch;
      const data = {
        ...rest,
        sourceBranch,
        targetBranch,
        removeSourceBranch: sourceIsDefaultBranch ? false : removeSourceBranch,
      };
      if (formData) {
        data.action = 'edit';
        operateMR(data).then((result) => {
          // 更新列表tab上的统计数据
          getRepoInfo();
          onOk(result);
          form.current?.resetFields();
          clearMRStats();
        });
      } else {
        createMR(data).then((result) => {
          const callBackFun = () => {
            getRepoInfo();
            onOk(result);
            form.current?.resetFields();
            clearMRStats();
          };
          const curChosenIssue = issueRef.current?.getChosenIssues() || [];

          if (curChosenIssue.length) {
            batchCreatCommentStream
              .fetch({
                issueStreams: curChosenIssue.map((item) => ({
                  issueID: item.id,
                  type: 'RelateMR',
                  content: '',
                  userID: loginUser.id,
                  mrInfo: {
                    appID: +appId,
                    mrID: result?.data?.mergeId,
                    mrTitle: result?.data?.title,
                  },
                })),
              })
              .then(() => {
                message.success(i18n.t('dop:relation added successfully'));
              })
              .finally(() => {
                callBackFun();
              });
          } else {
            callBackFun();
          }
        });
      }
    });
  };
  let disableSubmitTip: string | null = null;
  if (mrStats.hasError) {
    disableSubmitTip = i18n.t('dop:merge request has errors');
  }
  return (
    <div className="repo-mr-form flex flex-col h-full">
      <div className="flex-1 overflow-auto pb-4">
        <TplModel
          visible={tplModelVisible}
          tplContent={tplContent}
          templateConfig={templateConfig}
          onOk={createTemplate}
          onCancel={() => {
            toggleTplModel(false);
          }}
        />
        <RenderForm ref={form} layout="vertical" list={getFieldsList()} />
        {isEdit ? null : <IssueRelation ref={issueRef} />}
        {children}
      </div>

      <div className={'repo-mr-bottom-bar'}>
        <Tooltip title={disableSubmitTip}>
          <Button type="primary" disabled={!!disableSubmitTip} onClick={() => handleSubmit(form.current)}>
            {i18n.t('submit')}
          </Button>
        </Tooltip>
        <Button className="ml-3" onClick={onCancel}>
          {i18n.t('cancel')}
        </Button>
      </div>
    </div>
  );
};

const IssueRelation = React.forwardRef<{ getChosenIssues: () => ISSUE.IssueType }>((_, ref) => {
  const [chosenIssues, setChosenIssues] = React.useState<ISSUE.IssueType[]>([]);
  const projectId = routeInfoStore.useStore((s) => s.params.projectId);
  const userMap = useUserMap();
  const addRelation = (issueId: number, issue: ISSUE.IssueType) => {
    if (!chosenIssues.find((item) => item.id === issueId)) {
      setChosenIssues((prev) => prev.concat(issue));
    }
  };

  React.useEffect(() => {
    if (ref) {
      ref.current = {
        getChosenIssues: () => chosenIssues,
      };
    }
  }, [chosenIssues, ref]);

  const getColumns = (): Array<ColumnProps<ISSUE.IssueType>> => [
    {
      title: i18n.t('{name} title', { name: i18n.t('dop:issue') }),
      dataIndex: 'title',
      render: (v: string, record: ISSUE.IssueType) => {
        const { type, id, iterationID: _iterationID } = record;
        const url =
          type === ISSUE_TYPE.TICKET
            ? goTo.resolve.ticketDetail({ projectId, issueId: id })
            : _iterationID === -1
            ? goTo.resolve.backlog({ projectId, issueId: id, issueType: type })
            : goTo.resolve.issueDetail({
                projectId,
                issueType: type.toLowerCase(),
                issueId: id,
                iterationId: _iterationID,
              });
        return (
          <Tooltip title={`${v}`}>
            <Link to={url} target="_blank" className="flex items-center justify-start  w-full">
              <IssueIcon type={record.type as any} />
              <span className="flex-1 nowrap">{`${v}`}</span>
            </Link>
          </Tooltip>
        );
      },
    },
    {
      title: i18n.t('status'),
      dataIndex: 'state',
      render: (v: number, record: any) => {
        const currentState = find(record?.issueButton, (item) => item.stateID === v);
        return currentState ? <IssueState stateID={currentState.stateID} /> : undefined;
      },
    },
    {
      title: i18n.t('dop:priority'),
      dataIndex: 'priority',
      render: (v: string) => (v ? ISSUE_PRIORITY_MAP[v]?.iconLabel : null),
    },
    {
      title: i18n.t('dop:assignee'),
      dataIndex: 'assignee',
      render: (userId: string) => {
        const curUser = userMap[userId];
        return (
          <div>
            <Avatar src={curUser?.avatar || undefined} size="small" className="flex-shrink-0">
              {curUser?.nick ? getAvatarChars(curUser.nick) : i18n.t('none')}
            </Avatar>
            <span> {curUser?.nick || curUser?.name || userId}</span>
          </div>
        );
      },
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      render: (v: string) => moment(v).format('YYYY/MM/DD HH:mm:ss'),
    },
  ];

  const actions = {
    render: (record: ISSUE.IssueType) => {
      return [
        {
          title: i18n.t('delete'),
          onClick: () => {
            setChosenIssues((prev) => prev.filter((item) => item.id !== record.id));
          },
        },
      ];
    },
  };

  return (
    <div className="mb-3 repo-mr-issue-relation">
      <div className="section-title mt-3">{i18n.t('relate to issue')}</div>

      <AddIssueRelation editAuth onSave={addRelation} projectId={projectId} hideCancelButton />

      <Table
        wrapperClassName="mt-2"
        columns={getColumns()}
        dataSource={chosenIssues}
        actions={actions}
        hideHeader
        pagination={false}
        scroll={{ x: 900 }}
        rowKey={(rec: ISSUE.IssueType, i: number | undefined) => `${i}${rec.id}`}
      />
    </div>
  );
});

const Mapper = () => {
  const [info, mrStats, templateConfig] = repoStore.useStore((s) => [s.info, s.mrStats, s.templateConfig]);
  const params = routeInfoStore.useStore((s) => s.params);
  const sideFold = layoutStore.useStore((s) => s.sideFold);
  const { getRepoInfo, getRepoBlob, getCompareDetail, getMRStats, createMR, operateMR, getTemplateConfig, commit } =
    repoStore.effects;
  const { clearMRStats } = repoStore.reducers;
  return {
    sideFold,
    info,
    mrStats,
    params,
    templateConfig,
    getRepoInfo,
    getRepoBlob,
    getCompareDetail,
    getMRStats,
    clearMRStats,
    createMR,
    operateMR,
    getTemplateConfig,
    commit,
  };
};

export default connectCube(connectUser(RepoMRForm), Mapper);
