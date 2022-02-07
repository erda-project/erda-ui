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
import { Input, Spin } from 'antd';
import { getMspProjectList, getProjectStatistics } from 'msp/services';
import ErdaIcon from 'common/components/erda-icon';
import { fromNow, goTo } from 'common/utils';
import { debounce, last } from 'lodash';
import { DOC_MSP_HOME_PAGE } from 'common/constants';
import bgLarge from 'app/images/msp/header-bg-large.svg';
import bgMiddle from 'app/images/msp/header-bg-middle.svg';
import bgSmall from 'app/images/msp/header-bg-small.svg';
import topImg from 'app/images/msp/microservice-governance-top.svg';
import middleImg from 'app/images/msp/microservice-governance-middle.svg';
import bottomImg from 'app/images/msp/microservice-governance-bottom.svg';
import backgroundImg from 'app/images/msp/microservice-governance-background.svg';
import decorationImg from 'app/images/msp/microservice-governance-decoration.svg';
import List from 'common/components/base-list';
import i18n from 'i18n';
import './overview.scss';

const iconMap: {
  [key in MS_INDEX.IMspProject['type']]: {
    icon: string;
    tag: string;
    color: string;
  };
} = {
  DOP: {
    icon: 'DevOps',
    tag: i18n.t('msp:DevOps Project'),
    color: 'blue',
  },
  MSP: {
    icon: 'MSP',
    tag: i18n.t('cmp:Monitor Project'),
    color: 'green',
  },
};

const metric: {
  dataIndex: keyof MS_INDEX.IMspProject;
  name: string;
  renderData: (data: MS_INDEX.IMspProject) => React.ReactNode;
}[] = [
  {
    dataIndex: 'relationship',
    name: i18n.t('env'),
    renderData: (data) => data.relationship.length,
  },
  {
    dataIndex: 'serviceCount',
    name: i18n.t('service'),
    renderData: (data) => data.serviceCount ?? 0,
  },
  {
    dataIndex: 'last24hAlertCount',
    name: i18n.t('msp:last 1 day alarm'),
    renderData: (data) => data.last24hAlertCount ?? 0,
  },
  {
    dataIndex: 'lastActiveTime',
    name: i18n.t('msp:last active time'),
    renderData: (data) => (data.lastActiveTime ? fromNow(data.lastActiveTime) : '-'),
  },
];

const Overview = () => {
  const [projectsList, loading] = getMspProjectList.useState();
  const projectStatistics = getProjectStatistics.useData();
  const [filterKey, setFilterKey] = React.useState('');

  React.useEffect(() => {
    document.title = `${i18n.t('msp')} · Erda`;
    getMspProjectList.fetch({ withStats: false });
  }, []);

  React.useEffect(() => {
    if (projectsList?.length) {
      getProjectStatistics.fetch({
        projectIds: projectsList.map((item) => item.id),
      });
    }
  }, [projectsList]);

  const handleSearch = React.useCallback(
    debounce((keyword?: string) => {
      setFilterKey(keyword?.toLowerCase() || '');
    }, 1000),
    [],
  );

  const projectsListWithStatics = React.useMemo(() => {
    const list = projectsList ?? [];
    if (!projectStatistics) {
      return list;
    } else {
      return list.map((item) => {
        const statistics = projectStatistics[item.id];
        return {
          ...item,
          ...statistics,
        };
      });
    }
  }, [projectsList, projectStatistics]);

  const list = React.useMemo(() => {
    return projectsListWithStatics
      .filter((item) => item.displayName.toLowerCase().includes(filterKey))
      .map((item) => {
        const { logo, desc, displayName, type, relationship, id } = item;
        return {
          ...item,
          logoURL: logo,
          icon: logo ? undefined : iconMap[type].icon,
          title: displayName,
          description: desc || i18n.t('no description yet'),
          tags: [
            {
              label: iconMap[type].tag,
              color: iconMap[type].color,
            },
          ],
          kvInfos: metric.map((t) => {
            return {
              key: t.name,
              value: t.renderData(item),
              compWapper: (comp: JSX.Element) => <>{comp}</>,
            };
          }),
          itemProps: {
            onClick: () => {
              const lastRelation = last(relationship);
              if (lastRelation) {
                goTo(goTo.pages.mspOverview, {
                  tenantGroup: lastRelation.tenantId,
                  projectId: id,
                  env: lastRelation.workspace,
                });
              }
            },
          },
        };
      });
  }, [projectsListWithStatics, filterKey]);

  return (
    <div className="msp-overview flex flex-col pt-0">
      <div className="msp-overview-header relative overflow-hidden flex content-center justify-center pl-4 flex-col">
        <img src={bgLarge} className="absolute bg-large" />
        <img src={bgMiddle} className="absolute bg-middle" />
        <img src={bgSmall} className="absolute bg-small" />
        <p className="mb-0 text-xl leading-8 font-medium">{i18n.t('msp')}</p>
        <p className="mb-0 text-xs leading-5 flex">
          {i18n.t(
            'msp:Provides one-stop service system observation, including service monitoring, tracing, dashboard, and alarm.',
          )}
          <a className="flex" href={DOC_MSP_HOME_PAGE} target="_blank" rel="noopener noreferrer">
            {i18n.t('msp:view guide')} <ErdaIcon size={14} type="jinru" className="mb-0" />
          </a>
        </p>
        <div className="header-img-wrapper absolute right-0 top-4">
          <img src={backgroundImg} className="absolute bottom-0 background-img" />
          <img src={bottomImg} className="absolute bottom-img" />
          <img src={middleImg} className="absolute middle-img" />
          <img src={topImg} className="absolute top-img" />
          <img src={decorationImg} className="absolute decoration-img left" />
          <img src={decorationImg} className="absolute decoration-img right" />
          <img src={decorationImg} className="absolute decoration-img top" />
        </div>
      </div>
      <div className="bg-white mr-4 rounded-sm shadow-card">
        <div className="h-12 flex items-center px-4 bg-default-02">
          <Input
            prefix={<ErdaIcon type="search1" />}
            bordered={false}
            allowClear
            placeholder={i18n.t('msp:search by project name')}
            className="bg-black-06 w-72"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
          />
        </div>
        <div className="p-4">
          <Spin spinning={loading}>
            <List getKey={(item) => item.id} dataSource={list} />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Overview;
