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
import { Col, Input, Row, Spin, Tag } from 'antd';
import { useUpdate } from 'common/use-hooks';
import { getMspProjectList } from 'msp/services';
import EmptyHolder from 'common/components/empty-holder';
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
import i18n from 'i18n';
import './overview.scss';

interface IState {
  data: MS_INDEX.IMspProject[];
  loading: boolean;
  filterKey: string;
}

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
    tag: i18n.t('cmp:Microservice Observation Project'),
    color: '#27C99A',
  },
};

const Overview = () => {
  const [{ data, loading, filterKey }, updater] = useUpdate<IState>({
    data: [],
    loading: false,
    filterKey: '',
  });
  const getList = async () => {
    updater.loading(true);
    try {
      const res = await getMspProjectList({ withStats: true });
      updater.data(res.data || []);
    } finally {
      updater.loading(false);
    }
  };

  React.useEffect(() => {
    document.title = `${i18n.t('msp')} · Erda`;
    getList();
  }, []);

  const handleClick = (relationship: MS_INDEX.IMspRelationship[], projectId: number) => {
    const item = last(relationship);
    if (item) {
      goTo(goTo.pages.mspOverview, { tenantGroup: item.tenantId, projectId, env: item.workspace });
    }
  };

  const handleSearch = React.useCallback(
    debounce((keyword?: string) => {
      updater.filterKey(keyword?.toLowerCase() || '');
    }, 1000),
    [],
  );

  const list = React.useMemo(() => {
    return data.filter((item) => item.displayName.toLowerCase().includes(filterKey));
  }, [data, filterKey]);

  return (
    <div className="msp-overview p-6 flex flex-col pt-0">
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
      <div className="flex flex-1 flex-col min-h-0 bg-white shadow pb-2">
        <div className="px-4 pt-2 bg-lotion">
          <Input
            prefix={<ErdaIcon type="search1" />}
            bordered={false}
            allowClear
            placeholder={i18n.t('msp:search by project name')}
            className="bg-hover-gray-bg mb-3 w-72"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
          />
        </div>
        <div className="px-2 flex-1 overflow-y-auto">
          <Spin spinning={loading}>
            {list.length ? (
              list.map(
                ({
                  type,
                  desc,
                  displayName,
                  id,
                  relationship,
                  serviceCount,
                  last24hAlertCount,
                  lastActiveTime,
                  logo,
                }) => {
                  const { icon, color, tag } = iconMap[type];
                  return (
                    <Row
                      key={id}
                      className="project-item card-shadow mb-2 mx-2 px-4 flex py-8 rounded-sm cursor-pointer transition-all duration-300 hover:bg-grey"
                      onClick={() => {
                        handleClick(relationship, id);
                      }}
                    >
                      <Col span={12} className="flex items-center">
                        <div className="w-14 h-14 mr-2">
                          {logo ? <img src={logo} width={56} height={56} /> : <ErdaIcon type={icon} size={56} />}
                        </div>
                        <div>
                          <p className="mb-0 font-medium text-xl leading-8">{displayName}</p>
                          <Tag className="mb-0.5 text-xs leading-5 border-0" color={color}>
                            {tag}
                          </Tag>
                          <div className="text-xs	leading-5 desc">{desc || '-'}</div>
                        </div>
                      </Col>
                      <Col span={12} className="flex items-center">
                        <Row gutter={8} className="flex-1">
                          <Col span={6}>
                            <p className="mb-0 text-xl leading-8 font-number">{relationship.length}</p>
                            <p className="mb-0 text-xs leading-5 desc">{i18n.t('env')}</p>
                          </Col>
                          <Col span={6}>
                            <p className="mb-0 text-xl leading-8 font-number">{serviceCount ?? 0}</p>
                            <p className="mb-0 text-xs leading-5 desc">{i18n.t('service')}</p>
                          </Col>
                          <Col span={6}>
                            <p className="mb-0 text-xl leading-8 font-number">{last24hAlertCount ?? 0}</p>
                            <p className="mb-0 text-xs leading-5 desc">{i18n.t('msp:last 1 day alarm')}</p>
                          </Col>
                          <Col span={6}>
                            <p className="mb-0 text-xl leading-8 font-number">
                              {lastActiveTime ? fromNow(lastActiveTime) : '-'}
                            </p>
                            <p className="mb-0 text-xs leading-5 desc">{i18n.t('msp:last active time')}</p>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  );
                },
              )
            ) : (
              <EmptyHolder relative />
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Overview;
