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

import React from 'react';
import i18n from 'i18n';
import { Row, Col, Button, Input, Tooltip, FormInstance } from 'antd';
import { theme } from 'app/themes';
import { ImageUpload, ErdaIcon, ConfirmDelete, Panel, Ellipsis, Icon as CustomIcon, FormModal } from 'common';
import { goTo, insertWhen } from 'common/utils';
import projectStore from 'app/modules/project/stores/project';
import { useQuotaFields } from 'org/pages/projects/create-project';
import layoutStore from 'layout/stores/layout';
import { removeMember } from 'common/services/index';
import routeInfoStore from 'core/stores/route';
import { updateTenantProject, deleteTenantProject } from 'msp/services';
import { HeadProjectSelector } from 'project/common/components/project-selector';
import userStore from 'app/user/stores';
import Card from 'org/common/card';
import { WORKSPACE_LIST } from 'common/constants';
import { useUpdate } from 'common/use-hooks';
import './index.scss';

// 修改项目信息后，更新左侧菜单上方的信息
let selectorKey = 1;
const reloadHeadInfo = () => {
  const detail = projectStore.getState((s) => s.info);
  layoutStore.reducers.setSubSiderInfoMap({
    key: 'project',
    detail: { ...detail, icon: theme.projectIcon },
    getHeadName: () => <HeadProjectSelector key={selectorKey} />, // 重新加载selector
  });
  selectorKey += 1;
};

const workSpaceList = ['DEV', 'TEST', 'STAGING', 'PROD'];

const resourceMap = {
  DEV: i18n.t('dev environment'),
  TEST: i18n.t('test environment'),
  STAGING: i18n.t('staging environment'),
  PROD: i18n.t('prod environment'),
};

const resourceIconMap = {
  DEV: <ErdaIcon type="dev" size={40} />,
  TEST: <ErdaIcon type="test" size={40} />,
  STAGING: <ErdaIcon type="staging" size={40} />,
  PROD: <ErdaIcon type="prod" size={40} />,
};

const Info = () => {
  const { updateProject, deleteProject, getLeftResources } = projectStore.effects;
  const loginUser = userStore.useStore((s) => s.loginUser);
  const orgName = routeInfoStore.useStore((s) => s.params.orgName);
  const info = projectStore.useStore((s) => s.info);

  const [
    {
      confirmProjectName,
      projectInfoEditVisible,
      projectInfoSaveDisabled,
      projectQuotaEditVisible,
      projectQuotaSaveDisabled,
      projectRollbackEditVisible,
      projectRollbackSaveDisabled,
    },
    updater,
  ] = useUpdate({
    confirmProjectName: '',
    projectInfoEditVisible: false,
    projectInfoSaveDisabled: true,
    projectQuotaEditVisible: false,
    projectQuotaSaveDisabled: true,
    projectRollbackEditVisible: false,
    projectRollbackSaveDisabled: true,
  });

  const { rollbackConfig } = info;

  const updatePrj = (values: Obj) => {
    const { isPublic = String(info.isPublic), resourceConfig } = values;
    if (resourceConfig) {
      Object.keys(values.resourceConfig)
        .filter((key) => resourceConfig[key])
        .forEach((key) => {
          resourceConfig[key] = {
            ...resourceConfig[key],
            cpuQuota: +resourceConfig[key].cpuQuota,
            memQuota: +resourceConfig[key].memQuota,
          };
        });
    }

    return updateProject({ ...values, isPublic: isPublic === 'true' }).then(() => {
      updateTenantProject({
        id: `${info.id}`,
        name: values.name,
        displayName: values.displayName,
        type: info.type === 'MSP' ? 'MSP' : 'DOP',
      });
      getLeftResources();
      reloadHeadInfo();
    });
  };

  const notMSP = info.type !== 'MSP';
  const fieldsListInfo = [
    {
      label: i18n.t('{name} identifier', { name: i18n.t('project') }),
      name: 'name',
      itemProps: {
        disabled: true,
      },
    },
    {
      label: i18n.t('Project name'),
      name: 'displayName',
    },
    ...insertWhen(notMSP, [
      {
        label: i18n.t('whether to put {name} in public', { name: i18n.t('project') }),
        name: 'isPublic',
        type: 'radioGroup',
        options: [
          {
            name: i18n.t('Public'),
            value: 'true',
          },
          {
            name: i18n.t('dop:Private-project'),
            value: 'false',
          },
        ],
      },
    ]),
    {
      label: i18n.t('Project logo'),
      name: 'logo',
      required: false,
      getComp: ({ form }: { form: FormInstance }) => <ImageUpload id="logo" form={form} showHint />,
      viewType: 'image',
    },
    {
      label: i18n.t('Project description'),
      name: 'desc',
      type: 'textArea',
      required: false,
      itemProps: { rows: 4, maxLength: 200 },
    },
  ];

  const fieldsListQuota = useQuotaFields(true, true);

  const inOrgCenter = location.pathname.startsWith(`/${orgName}/orgCenter`);
  const onDelete = async () => {
    updater.confirmProjectName('');
    await deleteProject();
    await deleteTenantProject({ projectId: info.id });
    if (inOrgCenter) {
      goTo(goTo.pages.orgCenterRoot, { replace: true });
    } else {
      goTo(goTo.pages.dopRoot, { replace: true });
    }
  };

  const exitProject = () => {
    removeMember({
      scope: { type: 'project', id: `${info.id}` },
      userIds: [loginUser.id],
    }).then(() => {
      goTo(goTo.pages.dopRoot, { replace: true });
    });
  };

  const projectInfoFormData = React.useMemo(() => ({ ...info, isPublic: `${info.isPublic || 'false'}` }), [info]);
  const projectRollbackForm = React.useMemo(() => {
    const configData = {};
    const fieldsListRollback: object[] = [];
    const sortBy = WORKSPACE_LIST;
    sortBy.forEach((workspace) => {
      const name = workspace.toUpperCase();
      const point = rollbackConfig?.[workspace];

      configData[`${name}`] = point || 5;
      fieldsListRollback.push({
        label: resourceMap[name] || name,
        name: ['rollbackConfig', name],
        type: 'inputNumber',
        itemProps: {
          max: 1000,
          min: 1,
          precision: 0,
        },
      });
    });
    return {
      fields: fieldsListRollback,
      data: { rollbackConfig: configData },
    };
  }, [rollbackConfig]);

  return (
    <div className="project-setting-info">
      <Card
        header={
          <div>
            {i18n.t('dop:basic information')}
            {notMSP ? (
              <Tooltip title={i18n.t('projects')}>
                <CustomIcon
                  type="link1"
                  className="ml-2 hover-active"
                  onClick={() => goTo(goTo.pages.project, { projectId: info.id })}
                />
              </Tooltip>
            ) : null}
          </div>
        }
        actions={
          <span className="hover-active" onClick={() => updater.projectInfoEditVisible(true)}>
            <ErdaIcon type="edit" size={16} className="mr-2 align-middle" />
          </span>
        }
      >
        <Row>
          <Col span={12} className="flex items-center pr-4">
            {info.logo && <img src={info.logo} className="w-16 h-16 mr-4" />}
            <div className={`${info.logo ? 'org-with-logo' : 'w-full'}`}>
              <Ellipsis title={info.displayName} className="text-xl label" />
              <Tooltip title={info.desc}>
                <div className="desc">{info.desc}</div>
              </Tooltip>
            </div>
          </Col>
          <Col span={12} className="py-1">
            <Panel
              columnNum={2}
              fields={[
                {
                  label: <Ellipsis title={info.name} />,
                  value: i18n.t('Project identifier'),
                },
                {
                  label: info.isPublic ? i18n.t('Public') : i18n.t('dop:Private-project'),
                  value: i18n.t('whether to put {name} in public', { name: i18n.t('project') }),
                },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {notMSP && (
        <>
          <Card
            header={i18n.t('dop:project quota')}
            actions={
              <span className="hover-active" onClick={() => updater.projectQuotaEditVisible(true)}>
                <ErdaIcon type="edit" size={16} className="mr-2 align-middle" />
              </span>
            }
          >
            {info.resourceConfig
              ? workSpaceList.map((key: string) => {
                  const resource = info.resourceConfig[key];
                  return (
                    <div className="erda-panel-list">
                      <Row>
                        <Col span={8} className="flex">
                          <div className="flex mr-3">{resourceIconMap[key]}</div>
                          <div>
                            <div className="label mb-1">{resourceMap[key]}</div>
                            <div className="text-xs">{resource.clusterName}</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <Panel
                            columnNum={4}
                            fields={[
                              {
                                value: (
                                  <div className="text-right relative top-1">
                                    <ErdaIcon type="CPU" size={34} />
                                  </div>
                                ),
                              },
                              {
                                label: `${+(+resource.cpuQuota).toFixed(3)} core`,
                                value: i18n.t('CPU quota'),
                              },
                              {
                                label: `${+(+resource.cpuRequest).toFixed(3)} core`,
                                value: i18n.t('Used'),
                              },
                              {
                                label: `${+(+resource.cpuRequestRate).toFixed(3)} %`,
                                value: i18n.t('cmp:Usage'),
                              },
                            ]}
                          />
                        </Col>
                        <Col span={8}>
                          <Panel
                            columnNum={4}
                            fields={[
                              {
                                value: (
                                  <div className="text-right relative top-1">
                                    <ErdaIcon type="GPU" size={34} />
                                  </div>
                                ),
                              },
                              {
                                label: `${+(+resource.memQuota).toFixed(3)} GiB`,
                                value: i18n.t('Memory quota'),
                              },
                              {
                                label: `${+(+resource.memRequest).toFixed(3)} GiB`,
                                value: i18n.t('Used'),
                              },
                              {
                                label: `${+(+resource.memRequestRate).toFixed(3)} %`,
                                value: i18n.t('cmp:Usage'),
                              },
                            ]}
                          />
                        </Col>
                      </Row>
                    </div>
                  );
                })
              : i18n.t('no quota')}
          </Card>
          <FormModal
            onOk={(result) =>
              updatePrj(result).then(() => {
                updater.projectQuotaEditVisible(false);
                updater.projectQuotaSaveDisabled(true);
              })
            }
            onCancel={() => {
              updater.projectQuotaEditVisible(false);
              updater.projectQuotaSaveDisabled(true);
            }}
            name={i18n.t('dop:project quota')}
            visible={projectQuotaEditVisible}
            fieldsList={fieldsListQuota}
            formData={info}
            okButtonState={projectQuotaSaveDisabled}
            onValuesChange={() => {
              updater.projectQuotaSaveDisabled(false);
            }}
          />
        </>
      )}

      <Card
        header={i18n.t('advanced settings')}
        actions={
          notMSP ? (
            <span className="hover-active" onClick={() => updater.projectRollbackEditVisible(true)}>
              <ErdaIcon type="edit" size={16} className="mr-2 align-middle" />
            </span>
          ) : null
        }
      >
        {notMSP ? (
          <>
            <div className="label">{i18n.t('dop:Rollback settings')}</div>
            <Row className="erda-panel-list">
              {Object.keys(info.rollbackConfig || {}).map((key: string) => (
                <Col span={6} className="flex">
                  <div className="flex mr-3">{resourceIconMap[key]}</div>
                  <div>
                    <div className="label">{info.rollbackConfig[key]}</div>
                    <div className="text-xs">{resourceMap[key]}</div>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="label">{i18n.t('Other settings')}</div>
          </>
        ) : null}
        <Row>
          <Col span={12} className="pr-2">
            <div className="erda-panel-list flex justify-between items-center">
              <div className="flex">
                <ErdaIcon type="dev" size={40} className="mr-3" />
                <div>
                  <div className="label">{i18n.t('common:exit current {name}', { name: i18n.t('project') })}</div>
                  <div className="text-xs">{i18n.t('common:exit-confirm-tip {name}', { name: i18n.t('project') })}</div>
                </div>
              </div>
              <ConfirmDelete
                confirmTip={false}
                title={i18n.t('sure to exit the current {name}?', { name: i18n.t('project') })}
                secondTitle={i18n.t('common:exit-sub-tip {name}', { name: i18n.t('project') })}
                onConfirm={exitProject}
              >
                <Button danger>{i18n.t('Exit')}</Button>
              </ConfirmDelete>
            </div>
          </Col>
          <Col span={12} className="pl-2">
            <div className="erda-panel-list flex justify-between items-center">
              <div className="flex">
                <ErdaIcon type="dev" size={40} className="mr-3" />
                <div>
                  <div className="label">{i18n.t('common:delete')}</div>
                  <div className="text-xs">
                    {i18n.t('Delete the {deleteItem} permanently. Please operate with caution.', i18n.t('app'))}
                  </div>
                </div>
              </div>
              <ConfirmDelete
                onConfirm={onDelete}
                deleteItem={`${i18n.t('project')}?`}
                onCancel={() => updater.confirmProjectName('')}
                disabledConfirm={confirmProjectName !== info.displayName}
                confirmTip={false}
                secondTitle={i18n.t(
                  'dop:The project cannot be restored after deletion. Please enter the {name} to confirm.',
                  {
                    name: info.displayName,
                  },
                )}
                modalChildren={
                  <Input
                    value={confirmProjectName}
                    placeholder={i18n.t('Please enter the {name}', { name: i18n.t('Project name') })}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updater.confirmProjectName(e.target.value)}
                  />
                }
              >
                <Button danger>{i18n.t('Delete')}</Button>
              </ConfirmDelete>
            </div>
          </Col>
        </Row>
      </Card>

      <FormModal
        onOk={(result) =>
          updatePrj(result).then(() => {
            updater.projectInfoEditVisible(false);
            updater.projectInfoSaveDisabled(true);
          })
        }
        onCancel={() => {
          updater.projectInfoEditVisible(false);
          updater.projectInfoSaveDisabled(true);
        }}
        name={i18n.t('dop:Project Information')}
        visible={projectInfoEditVisible}
        fieldsList={fieldsListInfo}
        formData={projectInfoFormData}
        okButtonState={projectInfoSaveDisabled}
        onValuesChange={() => {
          updater.projectInfoSaveDisabled(false);
        }}
      />
      <FormModal
        onOk={(result) =>
          updateProject({ ...result, isPublic: info.isPublic }).then(() => {
            updater.projectRollbackEditVisible(false);
            updater.projectRollbackSaveDisabled(true);
          })
        }
        onCancel={() => {
          updater.projectRollbackEditVisible(false);
          updater.projectRollbackSaveDisabled(true);
        }}
        name={i18n.t('dop:rollback point')}
        visible={projectRollbackEditVisible}
        fieldsList={projectRollbackForm.fields}
        formData={projectRollbackForm.data}
        okButtonState={projectRollbackSaveDisabled}
        onValuesChange={() => {
          updater.projectRollbackSaveDisabled(false);
        }}
      />
    </div>
  );
};

export default Info;
