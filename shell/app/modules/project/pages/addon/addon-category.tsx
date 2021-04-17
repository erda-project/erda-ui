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
import { Button, message } from 'app/nusi';
import AddonModal from '../third-service/components/addon-modal';
import { useUpdate } from 'common';
import { AddonCardList } from 'addonPlatform/pages/common/components/addon-card-list';
import i18n from 'i18n';
import { usePerm, WithAuth } from 'app/user/common';
import customAddonStore from 'project/stores/custom-addon';
import addonStore from 'common/stores/addon';
import { useLoading } from 'app/common/stores/loading';
import workBenchStore from 'workBench/stores';
import { useEffectOnce } from 'react-use';
import routeInfoStore from 'common/stores/route';
import { AddonType } from 'project/pages/third-service/components/config';
import { setSearch } from 'common/utils';
import { isEmpty } from 'lodash';

interface IData {
  instanceId: string;
  projectId: string;
  orgId: number;
  config?: Obj;
}

export const AddonCategory = () => {
  const permMap = usePerm(s => s.project.service);
  const addonSpecList = customAddonStore.useStore(s => s.addonList);
  const [projectAddonCategory, addonInsList] = workBenchStore.useStore(s => [s.projectAddonCategory, s.addonList]);
  const query = routeInfoStore.useStore(s => s.query);
  const timer = React.useRef<any>(0);

  useEffectOnce(() => {
    customAddonStore.getAddonsList();
    workBenchStore.getProjectAddons();
    return () => {
      workBenchStore.clearProjectAddons();
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  });
  const [loading] = useLoading(workBenchStore, ['getProjectAddons']);
  const [state, updater, update, reset] = useUpdate({
    modalVisible: false,
    editData: null,
  });
  React.useEffect(() => {
    if (query.env && query.addon === AddonType.APIGateway) {
      updater.modalVisible(true);
    }
  }, [query, updater]);
  const closeModal = () => {
    reset();
  };

  const loopAddonList = (id: string) => {
    let idExist = false;
    timer.current = setTimeout(() => {
      workBenchStore.getProjectAddons().then((res) => {
        if (!isEmpty((res || []).find(addon => addon.instanceId === id))) {
          idExist = true;
        }
        if (!idExist) {
          loopAddonList(id);
        } else if (timer.current) {
          clearTimeout(timer.current);
        }
      });
    }, 5000);
  };

  const handleOk = (values: any) => {
    const after = () => {
      workBenchStore.getProjectAddons();
      closeModal();
    };
    if (state.editData) {
      const { instanceId, projectId, orgId } = state.editData as any as IData;
      return customAddonStore.updateCustomAddonConfig({
        config: values.configs,
        instanceId,
        projectId: +projectId,
        orgId,
      }).then(after);
    } else {
      const { addonName, name, plan, addonInstanceRoutingId, configs, importConfig } = values;
      const newAddonType = addonSpecList.find(a => a.addonName === addonName);
      let config = null;
      if (importConfig) {
        try {
          config = JSON.parse(importConfig);
        } catch (e) {
          message.warn(i18n.t('project:JSON format error'));
        }
        if (config === null) {
          return Promise.reject();
        }
        return addonStore.importCustomAddon(config).then(() => {
          after();
        });
      }
      // 添加租户 addon
      if (addonInstanceRoutingId) {
        const data = { name, addonInstanceRoutingId, configs };
        return customAddonStore.addTenantAddonIns(data).then((addonInstanceID) => {
          after();
          // 轮询addon list
          loopAddonList(addonInstanceID);
        });
      }
      if (newAddonType?.category === 'custom') {
        // 添加云或自定义 addon
        return customAddonStore.addCustomAddonIns(values).then(after);
      }
      // 添加普通 addon
      const data: Omit<CUSTOM_ADDON.AddDiceAddOns, 'projectId' | 'clusterName'> = {
        addons: {
          [name]: {
            plan,
            options: configs,
          },
        },
        workspace: values.workspace,
        shareScope: 'PROJECT',
      };
      return customAddonStore.addDiceAddonIns(data).then((addonInstanceID) => {
        after();
        // 创建API 网关 后关闭当前tab页，并刷新父页面API网关
        if (query.env && query.addon === AddonType.APIGateway && addonName === AddonType.APIGateway) {
          setSearch({}, [], true);
          window.opener.refreshApiGateway && window.opener.refreshApiGateway({ workspace: values.workspace, addonInstanceID });
          window.close();
        } else {
          // 轮询addon list
          loopAddonList(addonInstanceID);
        }
      });
    }
  };

  const onEditAddon = (content: ADDON.Instance) => {
    const { instanceId } = content;
    addonStore.getAddonDetail(instanceId, true).then((detail: ADDON.Instance) => {
      update({
        modalVisible: true,
        editData: detail,
      });
    });
  };


  return (
    <>
      <AddonCardList
        isFetching={loading}
        searchPlaceHolder={i18n.t('project:filter by application')}
        addonCategory={projectAddonCategory}
        searchProps={['applicationName']}
        hideSearch
        onEitAddon={onEditAddon}
      />
      <div className="top-button-group">
        <WithAuth pass={permMap.addProjectService.pass} >
          <Button type="primary" onClick={() => updater.modalVisible(true)}>{i18n.t('project:add addon')}</Button>
        </WithAuth>
      </div>
      <AddonModal
        editData={state.editData as ADDON.Instance | null}
        visible={state.modalVisible}
        addonInsList={addonInsList}
        addonSpecList={addonSpecList}
        onOk={handleOk}
        onCancel={closeModal}
      />
    </>);
};
