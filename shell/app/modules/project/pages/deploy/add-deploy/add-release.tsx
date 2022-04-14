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
import { Button, Dropdown, Menu, Input } from 'antd';
import { ErdaIcon, Ellipsis, SimpleTabs } from 'common';
import { map, debounce } from 'lodash';
import { getJoinedApps } from 'app/user/services/user';
import ReleaseList from './release-list';
import { getDefaultPaging } from 'common/utils';
import { useUpdateEffect, useMount } from 'react-use';

import { getRelease } from 'project/services/deploy';
import { AppSelector } from 'application/common/app-selector';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import './add-release.scss';

interface IReleaseQuery {
  applicationId?: string;
  isProjectRelease?: boolean;
  pageNo?: number;
  version?: string;
  pageSize?: number;
}

const AddRelease = ({
  onSelect,
  detail,
}: {
  onSelect: (v: PROJECT_DEPLOY.Release) => void;
  detail: PROJECT_DEPLOY.ReleaseRenderDetail | null;
}) => {
  const projectId = routeInfoStore.useStore((s) => s.params.projectId);
  const [visible, setVisible] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState('project');

  const [selectedRelease, setSelectedRelease] = React.useState('');

  const [data] = getRelease.useState();
  const list = data?.list || [];
  const paging = data?.paging || getDefaultPaging();

  const getList = (query?: IReleaseQuery) => {
    getRelease.fetch({ pageNo: paging.pageNo, pageSize: paging.pageSize, ...query, projectId, isStable: true });
  };
  React.useEffect(() => {
    setSelectedRelease('');
  }, [selectedType]);

  const tabs = {
    project: {
      key: 'project',
      text: i18n.t('dop:Project Artifacts'),
      Comp: <ProjectRelease {...paging} list={list} getList={getList} onSelect={(v) => setSelectedRelease(v)} />,
    },
    app: {
      key: 'app',
      text: i18n.t('dop:App artifact'),
      Comp: (
        <AppRelease
          {...paging}
          projectId={projectId}
          list={list}
          getList={getList}
          onSelect={(v) => setSelectedRelease(v)}
        />
      ),
    },
  };
  const overlay = (
    <Menu theme="dark" className="project-deploy-add-release">
      <Menu.Item key="release" className="block h-full">
        <div className="flex flex-col h-full">
          <SimpleTabs
            theme="dark"
            className="mb-2"
            tabs={map(tabs, (tab) => ({ key: tab.key, text: tab.text }))}
            onSelect={setSelectedType}
            value={selectedType}
          />
          <div className="flex-1 h-0 overflow-auto">{tabs[selectedType].Comp}</div>
          <div className="flex justify-end pt-2">
            <Button
              className="theme-dark"
              onClick={() => {
                setVisible(false);
              }}
            >
              {i18n.t('Cancel')}
            </Button>
            <Button
              type="primary"
              className="theme-dark ml-3"
              disabled={!selectedRelease}
              onClick={() => {
                const release = list.find((item) => item.releaseId === selectedRelease) as PROJECT_DEPLOY.Release;
                onSelect(release);
                setVisible(false);
              }}
            >
              {i18n.t('ok')}
            </Button>
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown
      overlay={overlay}
      visible={visible}
      trigger={['click']}
      onVisibleChange={(vis) => {
        setVisible(vis);
      }}
    >
      <div
        onClick={() => setVisible(true)}
        className="rounded-sm py-0.5 px-2 flex-h-center cursor-pointer text-purple-deep bg-purple-light"
      >
        {detail ? (
          <>
            <ErdaIcon type={'zhongshi'} className="mr-1" />
            <span>{i18n.t('dop:switch artifact')}</span>
          </>
        ) : (
          <>
            <ErdaIcon type={'xuanze'} className="mr-1" />
            <span>{i18n.t('select {name}', { name: i18n.t('Artifacts') })}</span>
          </>
        )}
      </div>
    </Dropdown>
  );
};

interface IReleaseProps {
  pageNo: number;
  pageSize: number;
  projectId: string;
  total: number;
  onSelect: (v: string) => void;
  list: PROJECT_DEPLOY.Release[];
  getList: (q?: IReleaseQuery) => void;
}
const ProjectRelease = (props: IReleaseProps) => {
  const { onSelect, getList, list, ...rest } = props;
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedRelease, setSelectedRelease] = React.useState('');
  const getReleaseList = (q?: IReleaseQuery) => {
    getList({ isProjectRelease: true, version: searchValue, pageNo: 1, ...q });
  };

  React.useEffect(() => {
    if (selectedRelease && !list.find((item) => item.releaseId === selectedRelease)) {
      setSelectedRelease('');
    }
  }, [list, selectedRelease]);

  useMount(() => {
    getReleaseList();
  });

  useUpdateEffect(() => {
    onSelect(selectedRelease);
  }, [selectedRelease]);

  const debouncedChange = React.useRef(debounce(getReleaseList, 1000));

  useUpdateEffect(() => {
    debouncedChange.current({ version: searchValue, pageNo: 1 });
  }, [searchValue]);

  return (
    <div className="flex flex-col h-full">
      <Input
        bordered={false}
        className="theme-dark w-full mb-2"
        value={searchValue}
        prefix={<ErdaIcon size="16" fill={'white-3'} type="search" />}
        onChange={(e) => {
          const { value } = e.target;
          setSearchValue(value);
        }}
        placeholder={i18n.t('search {name}', { name: i18n.t('dop:release name') })}
      />

      <ReleaseList
        className="flex-1 h-0 overflow-auto"
        {...rest}
        getList={getReleaseList}
        value={selectedRelease}
        list={list}
        onSelect={setSelectedRelease}
      />
    </div>
  );
};

const AppRelease = (props: IReleaseProps) => {
  const { onSelect, list, getList, projectId, ...rest } = props;
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedRelease, setSelectedRelease] = React.useState('');
  const [selectedApp, setSelectedApp] = React.useState<IApplication | null>(null);
  const getReleaseList = (q?: IReleaseQuery) => {
    selectedAppRef.current &&
      getList({
        isProjectRelease: false,
        version: searchValue,
        pageNo: 1,
        applicationId: `${selectedAppRef.current.id}`,
        ...q,
      });
  };

  const debouncedChange = React.useRef(debounce(getReleaseList, 1000));
  const selectedAppRef = React.useRef(selectedApp);

  useUpdateEffect(() => {
    onSelect(selectedRelease);
  }, [selectedRelease]);

  React.useEffect(() => {
    if (selectedRelease && !list.find((item) => item.releaseId === selectedRelease)) {
      setSelectedRelease('');
    }
  }, [list, selectedRelease]);

  useUpdateEffect(() => {
    selectedAppRef.current = selectedApp;
    setSearchValue('');
    getReleaseList({ pageNo: 1 });
  }, [selectedApp]);

  useUpdateEffect(() => {
    debouncedChange.current({ version: searchValue, pageNo: 1 });
  }, [searchValue]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-h-center mb-2">
        <AppSelector
          autoSelect
          dropdownClassName="project-add-release-app"
          value={selectedApp?.id || ''}
          getData={(_q: { pageNo: number; pageSize: number }) => {
            return getJoinedApps({ projectId: +projectId, ..._q }).then((res) => res.data);
          }}
          onClickItem={(app) => setSelectedApp(app)}
          resultsRender={() => {
            return (
              <div className="w-[160px] px-2 leading-7 rounded-sm bg-white-06 flex text-white-3 hover:text-white-8 mr-2">
                {selectedApp ? (
                  <Ellipsis className="font-bold text-white" title={selectedApp?.displayName || selectedApp?.name} />
                ) : (
                  <span className="text-white-3">{i18n.t('please select')}</span>
                )}
                <ErdaIcon type="caret-down" className="ml-0.5" size="14" />
              </div>
            );
          }}
        />

        <Input
          bordered={false}
          className="theme-dark w-full "
          value={searchValue}
          prefix={<ErdaIcon size="16" fill={'white-3'} type="search" />}
          onChange={(e) => {
            const { value } = e.target;
            setSearchValue(value);
          }}
          placeholder={i18n.t('search {name}', { name: i18n.t('dop:release name') })}
        />
      </div>
      <ReleaseList
        className="flex-1 h-0 overflow-auto"
        {...rest}
        list={list}
        value={selectedRelease}
        getList={getReleaseList}
        onSelect={setSelectedRelease}
      />
    </div>
  );
};

export default AddRelease;
