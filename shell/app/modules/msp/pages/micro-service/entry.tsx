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
import { Tooltip, Input, Spin, Button } from 'app/nusi';
import { get, isEmpty } from 'lodash';
import { CardsLayout, Icon as CustomIcon, EmptyListHolder } from 'common';
import { theme } from 'app/themes';
import { goTo } from 'common/utils';
import { envMap } from 'msp/config';
import i18n from 'i18n';
import mspStore from 'msp/stores/micro-service';
import { useMount } from 'react-use';
import { useLoading } from 'core/stores/loading';
import './entry.scss';

const { Search } = Input;

interface IProps {
  [propName: string]: any;
  onClickEnv?: (data: object) => any;
}

export const PureMspEntry = (props: IProps) => {
  const [searchKey, setSearchKey] = React.useState('');
  const [filteredList, setFilteredList] = React.useState(props.mspProjectList);
  const [isFetching] = useLoading(mspStore, ['getMspProjectList']);
  const { getMspProjectList } = mspStore.effects;
  const mspProjectList = mspStore.useStore((s) => s.mspProjectList);

  useMount(() => {
    getMspProjectList();
  });

  React.useEffect(() => {
    mspProjectList &&
      setFilteredList(mspProjectList.filter((ms) => ms.projectName.toLowerCase().includes(searchKey.toLowerCase())));
  }, [mspProjectList, searchKey]);

  const onSearchKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = get(event, 'target.value');
    setSearchKey(value);
  };

  const onClickEnv = (tenantGroup: string, projectId: string, env: string) => {
    props.onClickEnv
      ? props.onClickEnv({ tenantGroup, projectId })
      : goTo(goTo.pages.mspOverview, { tenantGroup, projectId, env });
  };

  const cardRender = (content: any) => {
    const { projectName, projectId, tenantGroups } = content;
    const [dev, test, staging, prod] = tenantGroups;
    return (
      <div className="micro-service-item" key={projectId}>
        <div className="ms-item-main">
          <div className="item-img">
            <CustomIcon color type={theme.orgIcon} />
          </div>
          <div className="ms-item-info">
            <Tooltip title={projectName}>
              <div className="title bold-500 nowrap">{projectName}</div>
            </Tooltip>
            <div className="footer">
              <span>
                <CustomIcon type="yy-4" />
              </span>
            </div>
          </div>
        </div>
        <div className="ms-item-footer flex-box">
          <span className="env-btn">
            <Button disabled={!dev} onClick={() => onClickEnv(dev, projectId, 'DEV')}>
              {envMap.DEV}
            </Button>
          </span>
          <span className="env-btn">
            <Button disabled={!test} onClick={() => onClickEnv(test, projectId, 'TEST')}>
              {envMap.TEST}
            </Button>
          </span>
          <span className="env-btn">
            <Button disabled={!staging} onClick={() => onClickEnv(staging, projectId, 'STAGING')}>
              {envMap.STAGING}
            </Button>
          </span>
          <span className="env-btn">
            <Button disabled={!prod} onClick={() => onClickEnv(prod, projectId, 'PROD')}>
              {envMap.PROD}
            </Button>
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="micro-service-manage">
      <Spin wrapperClassName="full-spin-height" spinning={isFetching}>
        <div className="ms-filter">
          <Search
            className="data-select"
            value={searchKey}
            onChange={onSearchKeyChange}
            placeholder={i18n.t('msp:search by project name')}
          />
        </div>
        <div className="addons-content">
          {!isEmpty(filteredList) ? (
            <CardsLayout dataList={filteredList} contentRender={cardRender} />
          ) : (
            <EmptyListHolder />
          )}
        </div>
      </Spin>
    </section>
  );
};

export { PureMspEntry as MspEntry };
