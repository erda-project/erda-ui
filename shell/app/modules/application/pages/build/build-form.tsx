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

import * as React from 'react';
import { get, isEmpty, find } from 'lodash';
import { Select, Tooltip, Modal, Form, Alert, Button } from 'app/nusi';
import { RenderPureForm } from 'common';
import { WrappedFormUtils } from 'core/common/interface';
import { IFormItem } from 'common/components/render-formItem';
import { useMount } from 'react-use';
import i18n from 'i18n';
import buildStore from 'application/stores/build';
import appStore from 'application/stores/application';
import { usePerm } from 'user/common';
import './build-form.scss';
import { insertWhen } from 'common/utils';
import moment from 'moment';
import routeInfoStore from 'common/stores/route';
import orgStore from 'app/org-home/stores/org';

const { Option } = Select;

interface IProps {
  title: string;
  form: WrappedFormUtils;
  visible: boolean;
  onCancel(): void;
  onOk(data: BUILD.CreatePipelineBody): any
}

const evnBlockMap: { [key in APPLICATION.Workspace]: string } = {
  DEV: 'blockDev',
  TEST: 'blockTest',
  STAGING: 'blockStage',
  PROD: 'blockProd',
};

const BuildForm = ({ form, visible, onCancel, title, onOk }: IProps) => {
  const pipelineDetail = buildStore.useStore(s => s.pipelineDetail);
  const appID = routeInfoStore.useStore(s => s.params.appId);
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const branchInfo = appStore.useStore(s => s.branchInfo);
  const { blockStatus, unBlockStart, unBlockEnd } = appStore.useStore(s => s.detail);
  const { getBranchInfo } = appStore.effects;
  const [authObj, projectSetting] = usePerm(s => [s.app.pipeline, s.project.setting]);
  const [showTips, setShowTip] = React.useState(false);
  const [ymls, setYmls] = React.useState([] as string[]);
  const appBlocked = blockStatus !== 'unblocked';
  const { blockoutConfig } = currentOrg;
  const formRef = React.useRef(form);
  const onOkRef = React.useRef(onOk);

  const getYmlByBranch = (branch: string) => {
    buildStore.effects.getPipelineYmlList({ appID, branch }).then((data) => {
      setYmls(data);
    });
  };

  const changeBranch = (chosenBranch: string) => {
    const curWorkspace = getWorkspace(chosenBranch);
    form.setFieldsValue({ env: curWorkspace });
    getYmlByBranch(chosenBranch);
  };

  useMount(() => {
    getBranchInfo({ enforce: true });
  });

  const getWorkspace = (chosenBranch: string) => {
    const curWorkspace = get(find(branchInfo, { name: chosenBranch }), 'workspace') as APPLICATION.Workspace;
    const envBlocked = get(blockoutConfig, evnBlockMap[curWorkspace], false);
    setShowTip(envBlocked);
    return curWorkspace;
  };

  // 是否为有效分支：有权限且有workspace
  const isUsefulBranch = (b?: APPLICATION.IBranchInfo) => {
    if (!b) return false;
    let isUseful = b.isProtect
      ? authObj.executeProtected.pass
      : authObj.executeNormal.pass;
    if (isUseful && !b.workspace) isUseful = false;
    return isUseful;
  };

  const getUsefulBranch = () => {
    const usefulBranch = find(branchInfo, item => isUsefulBranch(item));
    return usefulBranch && usefulBranch.name;
  };

  const initBranch = React.useMemo(() => {
    // 如果当前选中的分支已经被删除， 那么新建流水线时，默认使用第一个有效分支
    let initialBranch;
    if (!isEmpty(pipelineDetail) && branchInfo.length > 0) {
      const branch = get(pipelineDetail, 'branch');
      initialBranch = isUsefulBranch(find(branchInfo, { name: branch })) ? branch : getUsefulBranch();
    }

    if (initialBranch) {
      getWorkspace(initialBranch);
      getYmlByBranch(initialBranch);
    }
    return initialBranch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchInfo, pipelineDetail]);

  const message = React.useMemo(() => {
    if (appBlocked) {
      return projectSetting.blockNetwork.applyUnblock.pass ? i18n.t('application:tips of blockNetwork for manager') : i18n.t('application:tips of blockNetwork for common');
    }
    if (unBlockStart && unBlockEnd) {
      return `${i18n.t('application:unblocking time period')}：${moment(unBlockStart).format('YYYY-MM-DD HH:mm')} ~ ${moment(unBlockEnd).format('YYYY-MM-DD HH:mm')}`;
    }
    return null;
  }, [appBlocked, unBlockStart, projectSetting.blockNetwork.applyUnblock.pass, unBlockEnd]);
  const formList: IFormItem[] = [
    {
      label: i18n.t('application:branch'),
      name: 'branch',
      type: 'select',
      initialValue: initBranch,
      options: () => branchInfo.map(e => {
        const { isProtect, name, workspace } = e;
        let hasAuth = isProtect
          ? authObj.executeProtected.pass
          : authObj.executeNormal.pass;
        let tip = hasAuth ? '' : i18n.t('application:branch is protected, you have no permission yet');
        if (hasAuth && !workspace) {
          hasAuth = false;
          tip = i18n.t('application:branch have no matching deployment environment');
        }
        return (
          <Option key={name} value={name} disabled={!hasAuth}>
            <Tooltip title={tip}>{name}</Tooltip>
          </Option>
        );
      }),
      itemProps: {
        showSearch: true,
        onChange: changeBranch,
      },
    },
    {
      label: i18n.t('application:pipeline file'),
      name: 'pipelineYmlName',
      type: 'select',
      initialValue: ymls[0],
      options: () => ymls.map(n => {
        return (
          <Option key={n} value={n}>
            {n}
          </Option>
        );
      }),
      itemProps: {
        showSearch: true,
      },
    },
    {
      label: i18n.t('application:environment'),
      name: 'env',
      initialValue: get(find(branchInfo, { name: initBranch }), 'workspace'),
      type: 'radioGroup',
      options: [
        {
          name: i18n.t('develop'),
          value: 'DEV',
        },
        {
          name: i18n.t('test'),
          value: 'TEST',
        },
        {
          name: i18n.t('staging'),
          value: 'STAGING',
        },
        {
          name: i18n.t('production'),
          value: 'PROD',
        },
      ],
      required: false,
      itemProps: {
        disabled: true,
      },
    },
    ...insertWhen(showTips && !!message, [{
      getComp: () => <Alert className='mb16' showIcon type={appBlocked ? 'error' : 'normal'} message={message} />,
    }]),
  ];

  const renderFooter = React.useMemo(() => {
    const handleOk = () => {
      formRef.current.validateFields((err, data) => {
        if (err) {
          return;
        }
        const { branch, pipelineYmlName } = data;
        onOkRef.current({ branch, pipelineYmlName });
      });
    };
    return (
      <>
        <Button onClick={onCancel}>{i18n.t('common:cancel')}</Button>
        <Button onClick={handleOk} type="primary" disabled={showTips && appBlocked}>{i18n.t('common:confirm')}</Button>
      </>
    );
  }, [appBlocked, onCancel, showTips]);

  return (
    <Modal
      title={title}
      visible={visible}
      footer={renderFooter}
      onCancel={onCancel}
    >
      <RenderPureForm
        className="build-branch-from"
        form={form}
        list={formList}
        layout="vertical"
      />
    </Modal>
  );
};

export default Form.create()(BuildForm) as any as (p: Omit<IProps, 'form'>) => JSX.Element;
