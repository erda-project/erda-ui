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
import { Tooltip, Input, Spin, Button } from 'app/nusi';
import { get, isEmpty } from 'lodash';
import { CardsLayout, Icon as CustomIcon, EmptyListHolder } from 'common';
import { theme } from 'app/themes';
import { goTo } from 'common/utils';
import { envMap } from 'microService/config';
import i18n from 'i18n';
import microServiceStore from 'microService/stores/micro-service';
import { useMount } from 'react-use';
import { useLoading } from 'app/common/stores/loading';
import './entry.scss';

const { Search } = Input;

interface IProps {
  [propName: string]: any;
  onClickEnv?: (data: object) => any;
}

export const PureMicroServiceEntry = (props: IProps) => {
  const [searchKey, setSearchKey] = React.useState('');
  const [filteredList, setFilteredList] = React.useState(props.microServiceProjectList);
  const [isFetching] = useLoading(microServiceStore, ['getMicroServiceProjectList']);
  const { getMicroServiceProjectList } = microServiceStore.effects;
  const microServiceProjectList = microServiceStore.useStore((s) => s.microServiceProjectList);

  useMount(() => {
    getMicroServiceProjectList();
  });

  React.useEffect(() => {
    microServiceProjectList &&
      setFilteredList(
        microServiceProjectList.filter((ms) => ms.projectName.toLowerCase().includes(searchKey.toLowerCase())),
      );
  }, [microServiceProjectList, searchKey]);

  const onSearchKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = get(event, 'target.value');
    setSearchKey(value);
  };

  const onClickEnv = (tenantGroup: string, projectId: string, env: string) => {
    props.onClickEnv
      ? props.onClickEnv({ tenantGroup, projectId })
      : goTo(goTo.pages.microServiceOverview, { tenantGroup, projectId, env });
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
              <div className="title font-medium nowrap">{projectName}</div>
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
            placeholder={i18n.t('microService:search by project name')}
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

export { PureMicroServiceEntry as MicroServiceEntry };
