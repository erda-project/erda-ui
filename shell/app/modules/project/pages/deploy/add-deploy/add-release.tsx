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
import { ErdaIcon, SimpleTabs, ConfigurableFilter } from 'common';
import { map, debounce } from 'lodash';
import { getJoinedApps } from 'app/user/services/user';
import ReleaseList from './release-list';
import { allWordsFirstLetterUpper, getDefaultPaging, goTo } from 'common/utils';
import { useUpdateEffect, useMount } from 'react-use';

import { getRelease } from 'project/services/deploy';
import routeInfoStore from 'core/stores/route';
import projectLabel from 'project/stores/label';
import i18n from 'i18n';
import './add-release.scss';

interface IReleaseQuery {
  applicationId?: string;
  isProjectRelease?: boolean;
  pageNo?: number;
  version?: string;
  pageSize?: number;
  from?: string;
  tags?: number[];
}

const AddRelease = ({
  onSelect,
  detail,
}: {
  onSelect: (v: PROJECT_DEPLOY.Release) => void;
  detail: PROJECT_DEPLOY.ReleaseRenderDetail | null;
}) => {
  const projectId = routeInfoStore.useStore((s) => s.params.projectId);
  const { getLabels } = projectLabel.effects;
  const [visible, setVisible] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState('project');

  const [selectedRelease, setSelectedRelease] = React.useState('');

  const [data] = getRelease.useState();
  const list = data?.list || [];
  const paging = data?.paging || getDefaultPaging();

  const getList = (query?: IReleaseQuery) => {
    getRelease.fetch({ pageNo: paging.pageNo, pageSize: paging.pageSize, projectId, ...query, isStable: true });
  };
  React.useEffect(() => {
    setSelectedRelease('');
  }, [selectedType]);

  React.useEffect(() => {
    getLabels({ type: 'release' });
  }, [getLabels]);

  const tabs = {
    project: {
      key: 'project',
      text: i18n.t('dop:Project Artifacts'),
      Comp: <ProjectRelease {...paging} list={list} getList={getList} onSelect={(v) => setSelectedRelease(v)} />,
    },
    app: {
      key: 'app',
      text: allWordsFirstLetterUpper(i18n.t('dop:App artifacts')),
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
    market: {
      key: 'market',
      text: (
        <span className="flex-h-center">
          Gallery{' '}
          <ErdaIcon
            onClick={(e) => {
              goTo(goTo.pages.galleryRoot, { jumpOut: true });
              e.stopPropagation();
            }}
            type="link"
            size={16}
            className="ml-1 hover:text-purple-deep jump-out-link"
          />
        </span>
      ),
      Comp: <MarketRelease {...paging} list={list} getList={getList} onSelect={(v) => setSelectedRelease(v)} />,
    },
  };
  const overlay = (
    <Menu className="project-deploy-add-release">
      <Menu.Item key="release" className="block h-full">
        <div className="flex flex-col h-full">
          <SimpleTabs
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
              {i18n.t('OK')}
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
            <span>{allWordsFirstLetterUpper(i18n.t('dop:switch artifact'))}</span>
          </>
        ) : (
          <>
            <ErdaIcon type={'xuanze'} className="mr-1" />
            <span>{allWordsFirstLetterUpper(i18n.t('select {name}', { name: i18n.t('Artifact') }))}</span>
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
  const labelsList = projectLabel.useStore((s) => s.list);
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedRelease, setSelectedRelease] = React.useState('');
  const [tags, setTags] = React.useState<number[]>([]);

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
    debouncedChange.current({ version: searchValue, pageNo: 1, tags });
  }, [searchValue, tags]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-h-center mb-2 mt-1">
        <ConfigurableFilter
          fieldsList={[
            {
              label: i18n.t('label'),
              type: 'tagsSelect',
              key: 'tags',
              required: false,
              options: labelsList.map((item) => ({ ...item, label: item.name, value: item.id })),
              itemProps: {
                mode: 'multiple',
              },
            },
            {
              type: 'input',
              key: 'version',
              label: i18n.t('release'),
              placeholder: i18n.t('search {name}', { name: i18n.t('dop:release name') }),
              outside: true,
            },
          ]}
          value={{ tags, version: searchValue }}
          onFilter={(data) => {
            setTags(data.tags);
            setSearchValue(data.version);
          }}
          onClear={() => {
            setTags([]);
          }}
          hideSave
          popoverProps={{
            getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentElement,
          }}
        />
      </div>

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
  const [selectedApp, setSelectedApp] = React.useState<number>();
  const [tags, setTags] = React.useState<number[]>([]);
  const labelsList = projectLabel.useStore((s) => s.list);
  const data = getJoinedApps.useData();
  const { list: appList } = data || {};
  const getReleaseList = (q?: IReleaseQuery) => {
    getList({
      isProjectRelease: false,
      version: searchValue,
      pageNo: 1,
      ...q,
    });
  };

  const debouncedChange = React.useRef(debounce(getReleaseList, 1000));

  React.useEffect(() => {
    getJoinedApps.fetch({ projectId: +projectId, pageSize: 200, pageNo: 1 });
  }, [projectId, getJoinedApps]);

  React.useEffect(() => {
    appList?.[0] && setSelectedApp(appList[0].id);
  }, [appList]);

  useUpdateEffect(() => {
    onSelect(selectedRelease);
  }, [selectedRelease]);

  React.useEffect(() => {
    if (selectedRelease && !list.find((item) => item.releaseId === selectedRelease)) {
      setSelectedRelease('');
    }
  }, [list, selectedRelease]);

  useUpdateEffect(() => {
    debouncedChange.current({ version: searchValue, applicationId: `${selectedApp}`, tags, pageNo: 1 });
  }, [searchValue, selectedApp, tags]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-h-center mb-2 mt-1">
        <ConfigurableFilter
          fieldsList={[
            {
              key: 'app',
              type: 'select',
              label: i18n.t('App'),
              mode: 'single',
              options: appList?.map((item) => ({ label: item.displayName, value: item.id })) || [],
              itemProps: {
                showSearch: true,
              },
              required: true,
            },
            {
              label: i18n.t('label'),
              type: 'tagsSelect',
              key: 'tags',
              required: false,
              options: labelsList.map((item) => ({ ...item, label: item.name, value: item.id })),
              itemProps: {
                mode: 'multiple',
              },
            },
            {
              type: 'input',
              key: 'version',
              label: i18n.t('release'),
              placeholder: i18n.t('search {name}', { name: i18n.t('dop:release name') }),
              outside: true,
            },
          ]}
          value={{ app: selectedApp, version: searchValue, tags }}
          onFilter={(data) => {
            setSelectedApp(data.app);
            setTags(data.tags);
            setSearchValue(data.version);
          }}
          onClear={() => {
            setTags([]);
          }}
          hideSave
          hideClear
          popoverProps={{
            getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentElement,
          }}
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

const MarketRelease = (props: IReleaseProps) => {
  const { onSelect, getList, list, ...rest } = props;
  const labelsList = projectLabel.useStore((s) => s.list);
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedRelease, setSelectedRelease] = React.useState('');
  const [tags, setTags] = React.useState<number[]>([]);

  const getReleaseList = (q?: IReleaseQuery) => {
    getList({ from: 'gallery', isProjectRelease: true, version: searchValue, pageNo: 1, ...q });
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
    debouncedChange.current({ version: searchValue, pageNo: 1, tags });
  }, [searchValue, tags]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-h-center mb-2 mt-1">
        <ConfigurableFilter
          fieldsList={[
            {
              label: i18n.t('label'),
              type: 'tagsSelect',
              key: 'tags',
              required: false,
              options: labelsList.map((item) => ({ ...item, label: item.name, value: item.id })),
              itemProps: {
                mode: 'multiple',
              },
            },
            {
              type: 'input',
              key: 'version',
              label: i18n.t('release'),
              placeholder: i18n.t('search {name}', { name: i18n.t('dop:release name') }),
              outside: true,
            },
          ]}
          value={{ tags, version: searchValue }}
          onFilter={(data) => {
            setTags(data.tags);
            setSearchValue(data.version);
          }}
          onClear={() => {
            setTags([]);
          }}
          hideSave
          popoverProps={{
            getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentElement,
          }}
        />
      </div>

      <ReleaseList
        className="flex-1 h-0 overflow-auto"
        {...rest}
        showProjectName
        getList={getReleaseList}
        value={selectedRelease}
        list={list}
        onSelect={setSelectedRelease}
      />
    </div>
  );
};

export default AddRelease;
