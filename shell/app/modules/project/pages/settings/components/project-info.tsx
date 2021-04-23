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
import i18n from 'i18n';
import { Tooltip, Button, Input } from 'app/nusi';
import { WrappedFormUtils } from 'core/common/interface';
import { theme } from 'app/themes';
import { ImageUpload, Icon as CustomIcon, ConfirmDelete } from 'common';
import { goTo } from 'common/utils';
import { SectionInfoEdit } from 'project/common/components/section-info-edit';
import projectStore from 'app/modules/project/stores/project';
import { useQuotaFields } from 'org/pages/projects/create-project';
import layoutStore from 'layout/stores/layout';
import { removeMember } from 'common/services/index';
import routeInfoStore from 'common/stores/route';
import diceEnv from 'dice-env';
import { HeadProjectSelector } from 'project/common/components/project-selector';
import userStore from 'app/user/stores';

interface IProps {
  canEdit: boolean
  canDelete: boolean
  canEditQuota: boolean
  showQuotaTip: boolean
}

// 修改项目信息后，更新左侧菜单上方的信息
let selectorKey = 1;
const reloadHeadInfo = () => {
  const detail = projectStore.getState(s => s.info);
  layoutStore.reducers.setSubSiderInfoMap({
    key: 'project',
    detail: { ...detail, icon: theme.projectIcon },
    getHeadName: () => <HeadProjectSelector key={selectorKey} />, // 重新加载selector
  });
  selectorKey += 1;
};

export default ({ canEdit, canDelete, canEditQuota, showQuotaTip }: IProps) => {
  const { updateProject, deleteProject, getLeftResources } = projectStore.effects;
  const loginUser = userStore.useStore(s => s.loginUser);
  const orgName = routeInfoStore.useState(s => s.params.orgName);
  const info = projectStore.useStore(s => s.info);
  const [confirmProjectName, setConfirmProjectName] = React.useState('');
  const updatePrj = (values: Obj) => {
    const { cpuQuota, memQuota, isPublic } = values;
    updateProject({ ...values, cpuQuota: +cpuQuota, memQuota: +memQuota, isPublic: isPublic === 'true' }).then(() => {
      getLeftResources();
      reloadHeadInfo();
    });
  };
  const fieldsList = [
    {
      label: i18n.t('{name} identify', { name: i18n.t('project') }),
      name: 'name',
      itemProps: {
        disabled: true,
      },
    },
    {
      label: i18n.t('project name'),
      name: 'displayName',
    },
    {
      label: i18n.t('whether public {name}', { name: i18n.t('project') }),
      name: 'isPublic',
      type: 'radioGroup',
      options: [{
        name: i18n.t('project:public project'),
        value: 'true',
      }, {
        name: i18n.t('project:private project'),
        value: 'false',
      }],
    },
    {
      label: i18n.t('project:project icon'),
      name: 'logo',
      required: false,
      getComp: ({ form }: { form: WrappedFormUtils }) => <ImageUpload id="logo" form={form} showHint />,
      viewType: 'image',
    },
    {
      label: i18n.t('project:project description'),
      name: 'desc',
      type: 'textArea',
      required: false,
      itemProps: { rows: 4, maxLength: 200 },
    },
    ...useQuotaFields(canEditQuota, showQuotaTip, { cpuQuota: info.cpuQuota, memQuota: info.memQuota }),
    // {
    //   label: i18n.t('project:DingTalk notification address'),
    //   name: 'ddHook',
    //   required: false,
    // },
  ];

  const inOrgCenter = location.pathname.startsWith(`/${orgName}/orgCenter`);
  const onDelete = () => {
    setConfirmProjectName('');
    deleteProject().then(() => {
      if (inOrgCenter) {
        goTo(goTo.pages.orgCenterRoot, { replace: true });
      } else {
        goTo(goTo.pages.workBenchRoot, { replace: true });
      }
    });
  };

  const exitProject = () => {
    removeMember({
      scope: { type: 'project', id: `${info.id}` },
      userIds: [loginUser.id],
    }).then(() => {
      goTo(goTo.pages.workBenchRoot, { replace: true });
    });
  };

  const extraSectionList = [
    {
      title: i18n.t('exit {name}', { name: i18n.t('project') }),
      children: (
        <ConfirmDelete
          title={i18n.t('sure to exit the current {name}?', { name: i18n.t('project') })}
          confirmTip={i18n.t('common:exit-confirm-tip {name}', { name: i18n.t('project') })}
          secondTitle={i18n.t('common:exit-sub-tip {name}', { name: i18n.t('project') })}
          onConfirm={exitProject}
        >
          <Button ghost type="danger">{ i18n.t('common:exit current {name}', { name: i18n.t('project') }) }</Button>
        </ConfirmDelete>
      ),
    },
  ];
  if (canDelete) {
    extraSectionList.push({
      title: i18n.t('project:delete project'),
      children: (
        <ConfirmDelete
          deleteItem={i18n.t('project')}
          onConfirm={onDelete}
          secondTitle={i18n.t('project:delete project {name} tips', { name: info.displayName })}
          onCancel={() => setConfirmProjectName('')}
          disabledConfirm={confirmProjectName !== info.displayName}
          modalChildren={(
            <Input value={confirmProjectName} placeholder={i18n.t('please enter {name}', { name: i18n.t('project name') })} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmProjectName(e.target.value)} />
            )}
        />
      ),
    });
  }

  const formName = i18n.t('project:project info');
  return (
    <SectionInfoEdit
      hasAuth={canEdit}
      data={{ ...info, isPublic: `${info.isPublic || 'false'}` }}
      fieldsList={fieldsList}
      updateInfo={updatePrj}
      extraSections={extraSectionList}
      name={
        info.id && inOrgCenter ? (
          <div>
            {formName}
            <Tooltip title={i18n.t('project:applications')} >
              {
                !diceEnv.ONLY_FDP && (
                  <CustomIcon
                    type="link1"
                    className="ml8 hover-active"
                    onClick={() => goTo(goTo.pages.project, { projectId: info.id })}
                  />
                )
              }
            </Tooltip>
          </div>
        ) : formName
      }
      formName={formName}
    />
  );
};
