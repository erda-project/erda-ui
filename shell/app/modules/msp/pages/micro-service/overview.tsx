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
import { Input, Tag } from 'antd';
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
import CardList, { CardColumnsProps } from 'common/components/card-list';
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
    color: '#1890FF',
  },
  MSP: {
    icon: 'MSP',
    tag: i18n.t('cmp:Monitor Project'),
    color: '#27C99A',
  },
};

const metric: { dataIndex: keyof MS_INDEX.IMspProject; name: string; renderData: (data: any) => React.ReactNode }[] = [
  {
    dataIndex: 'relationship',
    name: i18n.t('env'),
    renderData: (data: MS_INDEX.IMspRelationship[]) => data.length,
  },
  {
    dataIndex: 'serviceCount',
    name: i18n.t('service'),
    renderData: (data: number) => data ?? 0,
  },
  {
    dataIndex: 'last24hAlertCount',
    name: i18n.t('msp:last 1 day alarm'),
    renderData: (data: number) => data ?? 0,
  },
  {
    dataIndex: 'lastActiveTime',
    name: i18n.t('msp:last active time'),
    renderData: (data: number) => (data ? fromNow(data) : '-'),
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

  const handleClick = (relationship: MS_INDEX.IMspRelationship[], projectId: string) => {
    const item = last(relationship);
    if (item) {
      goTo(goTo.pages.mspOverview, { tenantGroup: item.tenantId, projectId, env: item.workspace });
    }
  };

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
    return projectsListWithStatics.filter((item) => item.displayName.toLowerCase().includes(filterKey));
  }, [projectsListWithStatics, filterKey]);

  const columns: CardColumnsProps<MS_INDEX.IMspProject>[] = [
    {
      dataIndex: 'displayName',
      colProps: {
        className: 'flex items-center',
      },
      render: (displayName: string, { logo, desc, type }) => {
        const { icon, color, tag } = iconMap[type];
        return (
          <>
            <div className="w-14 h-14 mr-2">
              {logo ? <img src={logo} width={56} height={56} /> : <ErdaIcon type={icon} size={56} />}
            </div>
            <div>
              <p className="mb-0 font-medium text-xl leading-8">{displayName}</p>
              <Tag className="mb-0.5 text-xs leading-5 border-0" color={color}>
                {tag}
              </Tag>
              <div className="text-xs	leading-5 desc">{desc || i18n.t('no description yet')}</div>
            </div>
          </>
        );
      },
    },
    {
      dataIndex: 'id',
      colProps: {
        className: 'flex items-center',
      },
      children: {
        columns: metric.map((item) => ({
          dataIndex: item.dataIndex,
          colProps: {
            span: 6,
          },
          render: (text) => (
            <>
              <p className="mb-0 text-xl leading-8 font-number">{item.renderData(text)}</p>
              <p className="mb-0 text-xs leading-5 desc">{item.name}</p>
            </>
          ),
        })),
      },
    },
  ];

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
          <a className="flex" href={DOC_MSP_HOME_PAGE} target="_blank">
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
      <CardList<MS_INDEX.IMspProject>
        rowKey="id"
        size="large"
        loading={loading}
        columns={columns}
        dataSource={list}
        rowClick={({ relationship, id }) => {
          handleClick(relationship, id);
        }}
        slot={
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
        }
      />
    </div>
  );
};

export default Overview;
