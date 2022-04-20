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
import { Row, Col, Button, Timeline, Collapse, Modal, message } from 'antd';
import moment from 'moment';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { ErdaIcon, Pagination, ConfigurableFilter } from 'common';
import { PAGINATION } from 'app/constants';
import routeInfoStore from 'core/stores/route';
import memberStore from 'common/stores/application-member';
import releaseStore from 'project/stores/release';
import projectLabel from 'project/stores/label';
import { MemberScope } from 'common/stores/member-scope';
import { getReleaseList } from 'project/services/release';
import empty from 'app/images/empty-white-bg.svg';

import './release-select.scss';

const { Panel } = Collapse;

interface IProps {
  value: Array<{ active: boolean; list: Item[] }>;
  readOnly?: boolean;
  onChange?: (values: Array<{ active: boolean; list: Item[] }>) => void;
  renderSelectedItem?: (item: Item) => React.ReactNode;
}

interface Item {
  id: string;
  pId: string;
  applicationName: string;
  version: string;
  createdAt: string;
}

const ReleaseSelect = ({
  value,
  readOnly = false,
  onChange,
  renderSelectedItem = defaultRenderSelectedItem,
}: IProps) => {
  const [releaseVisible, setReleaseVisible] = React.useState<boolean>(false);
  const [groupList, setGroupList] = React.useState<Array<{ active: boolean; list: Item[] }>>([
    { active: true, list: [] },
  ]);
  const [currentGroup, setCurrentGroup] = React.useState<number>(0);
  const [selectedList, setSelectedList] = React.useState<Item[]>([]);

  const select = (selectItem: Item, checked: boolean) => {
    const groupIndex = groupList.findIndex((group) => group.list.find((item) => item.pId === selectItem.pId));
    if (groupIndex === -1 || groupIndex === currentGroup) {
      setSelectedList((prev) =>
        checked
          ? [...prev.filter((item) => item.pId !== selectItem.pId), selectItem]
          : prev.filter((item) => item.id !== selectItem.id),
      );
    } else {
      message.error(
        i18n.t('dop:this application already has release selected in {name}', {
          name: i18n.t('dop:group {index}', { index: groupIndex + 1 }),
        }),
      );
    }
  };

  const remove = (id: string) => {
    setSelectedList((prev) => prev.filter((item) => item.id !== id));
  };

  const clear = () => {
    setSelectedList([]);
  };

  const removeGroup = (index: number, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const _groupList = groupList.filter((_item, i) => i !== index);
    setGroupList(_groupList);
    onChange?.(_groupList);
  };

  const removeResult = (i: number, id: string) => {
    const { list: _list } = groupList[i];
    const currentList = [..._list];
    const index = _list.findIndex((item) => item.id === id);
    currentList.splice(index, 1);
    groupList[i].list = currentList;
    setGroupList([...groupList]);
    onChange?.(groupList);
  };

  const onOk = () => {
    groupList[currentGroup].list = selectedList;
    setGroupList(groupList);
    onChange?.([...groupList]);
    setReleaseVisible(false);
  };

  React.useEffect(() => {
    value && setGroupList(value);
  }, [value]);

  return (
    <div className="erda-list-select">
      <Timeline className="mt-1 project-release-time-line">
        {groupList.map((group, index) => (
          <Timeline.Item
            dot={
              <div className="leading-4">
                <i
                  className={`inline-block rounded-full border-primary border-solid w-2 h-2 ${
                    group.active ? 'bg-primary' : ''
                  }`}
                  style={{ borderWidth: 1 }}
                />
              </div>
            }
          >
            <Collapse
              activeKey={group.active ? ['1'] : []}
              onChange={() => {
                groupList[index].active = !groupList[index].active;
                setGroupList([...groupList]);
              }}
              ghost
              className="time-line-collapse"
            >
              <Panel
                header={
                  <span className={`time-line-collapse-header ${group.active ? 'active' : ''}`}>
                    <span className="group-title">{i18n.t('dop:group {index}', { index: index + 1 })}</span>
                    {group.list?.length ? (
                      <span className="bg-default-1 rounded-full px-2 py-0.5 text-xs ml-1">{group.list.length}</span>
                    ) : (
                      ''
                    )}
                    {!readOnly ? (
                      <ErdaIcon
                        className="float-right mr-5 mt-1 text-default-6 remove-group"
                        type="remove"
                        size={16}
                        onClick={(e: React.MouseEvent<HTMLElement>) => removeGroup(index, e)}
                      />
                    ) : (
                      ''
                    )}
                  </span>
                }
                key="1"
              >
                {group.list?.length ? (
                  <div className="bg-default-02 p-2">
                    {group.list?.map?.((item) => (
                      <div
                        className={`erda-list-select-selected-item flex items-center p-2 rounded-sm ${
                          !readOnly ? 'hover:bg-default-04' : ''
                        }`}
                        key={item.id}
                      >
                        <div className="flex-1 pr-2 overflow-auto">{renderSelectedItem(item)}</div>
                        {!readOnly ? (
                          <ErdaIcon
                            type="close-small"
                            size={24}
                            className="erda-list-select-selected-item-delete cursor-pointer text-default-4"
                            onClick={() => removeResult(index, item.id)}
                          />
                        ) : null}
                      </div>
                    ))}
                    {!readOnly ? (
                      <div
                        className="text-center text-purple-deep cursor-pointer"
                        onClick={() => {
                          setReleaseVisible(true);
                          setCurrentGroup(index);
                          setSelectedList(group.list);
                        }}
                      >
                        {i18n.t('dop:manage the group of releases')}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  <div className="bg-default-02 py-4 flex-all-center">
                    <img src={empty} className="mr-2" />
                    <div>
                      <div className="text-lg leading-6">{i18n.t('dop:No artifacts selected')}</div>
                      <div
                        className="text-xs text-purple-deep cursor-pointer leading-5"
                        onClick={() => {
                          setReleaseVisible(true);
                          setCurrentGroup(index);
                          setSelectedList([]);
                        }}
                      >
                        {i18n.t('dop:Click to add app artifacts')}
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            </Collapse>
          </Timeline.Item>
        ))}

        {!readOnly ? (
          <Timeline.Item
            dot={
              <div className="leading-4">
                <i
                  className="inline-block rounded-full border-primary border-solid w-2 h-2"
                  style={{ borderWidth: 1 }}
                />
              </div>
            }
          >
            <div
              className={'erda-list-select-btn px-2 leading-7 rounded-sm inline-flex items-center cursor-pointer'}
              onClick={() => setGroupList((prev) => [...prev, { active: true, list: [] }])}
            >
              <ErdaIcon type="plus" color="currentColor" size={16} className="mr-1" />
              {i18n.t('add {name}', { name: i18n.t('dop:group') })}
            </div>
          </Timeline.Item>
        ) : (
          ''
        )}
      </Timeline>
      <Modal
        visible={releaseVisible}
        onCancel={() => setReleaseVisible(false)}
        wrapClassName="no-wrapper-modal"
        width={1120}
        footer={null}
      >
        <ListSelectOverlay
          selectedList={selectedList}
          select={select}
          remove={remove}
          onOk={onOk}
          onCancel={() => setReleaseVisible(false)}
          clear={clear}
          renderSelectedItem={renderSelectedItem}
        />
      </Modal>
    </div>
  );
};

interface OverlayProps {
  selectedList: Item[];
  select: (selectItem: Item, checked: boolean) => void;
  remove: (id: string) => void;
  onOk: () => void;
  clear: () => void;
  onCancel: () => void;
  renderSelectedItem: (item: Item) => React.ReactNode;
}

interface FilterData {
  applicationId?: string;
  branchName?: string;
  commitId?: string;
  releaseId?: string;
  userId?: string;
  latest?: string;
  1?: string;
}

const ListSelectOverlay = ({
  selectedList,
  select,
  remove,
  onOk,
  clear,
  onCancel,
  renderSelectedItem,
}: OverlayProps) => {
  const { params } = routeInfoStore.getState((s) => s);
  const { projectId } = params;
  const labelsList = projectLabel.useStore((s) => s.list);
  const { appList } = releaseStore.getState((s) => s);
  const { getAppList } = releaseStore.effects;

  const [memberList] = memberStore.useStore((s) => [s.list]);
  const { getMemberList } = memberStore.effects;
  const [filterData, setFilterData] = React.useState<FilterData>({ latest: 'true' });
  const [releaseList, setReleaseList] = React.useState<RELEASE.ReleaseDetail[]>([] as RELEASE.ReleaseDetail[]);
  const [releaseTotal, setReleaseTotal] = React.useState(0);
  const [pageNo, setPageNo] = React.useState(1);
  const listPagination = {
    total: releaseTotal,
    current: pageNo,
    pageSize: PAGINATION.pageSize,
    onChange: (_pageNo: number) => {
      getReleases(_pageNo);
    },
  };

  const getReleases = React.useCallback(
    async (_pageNo: number) => {
      setPageNo(_pageNo);
      const res = await getReleaseList({
        projectId,
        pageNo: _pageNo,
        isProjectRelease: false,
        pageSize: PAGINATION.pageSize,
        isStable: true,
        ...filterData,
      });
      const { data } = res;
      if (data) {
        const { list, total } = data;
        setReleaseList(list.map((item) => ({ ...item, id: item.releaseId, pId: item.applicationId })));
        setReleaseTotal(total);
      }
    },
    [projectId, filterData],
  );

  React.useEffect(() => {
    getAppList({ projectId });
    getMemberList({ scope: { id: projectId, type: MemberScope.PROJECT }, pageNo: 1, pageSize: 10000 });
  }, [projectId, getAppList, getMemberList]);

  React.useEffect(() => {
    getReleases(1);
  }, [getReleases]);

  const fieldsList = [
    {
      key: 'applicationId',
      type: 'select',
      label: i18n.t('App'),
      mode: 'single',
      options: appList.map((item) => ({ label: item.displayName, value: item.id })),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('App') }),
    },
    {
      key: 'branchName',
      type: 'input',
      label: i18n.t('dop:branch'),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:branch') }),
    },
    {
      key: 'commitId',
      type: 'input',
      label: 'commitID',
      placeholder: i18n.t('filter by {name}', { name: 'commitID' }),
    },
    {
      key: 'releaseId',
      type: 'input',
      label: `${i18n.t('Artifacts')}ID`,
      placeholder: i18n.t('filter by {name}', { name: `${i18n.t('Artifacts')}ID` }),
    },
    {
      key: 'userId',
      type: 'select',
      label: i18n.t('Creator'),
      mode: 'single',
      options: memberList.map((item) => ({ label: item.nick, value: item.userId })),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Creator') }),
    },
    {
      key: 'latest',
      type: 'select',
      label: i18n.t('dop:only the latest version is displayed'),
      mode: 'single',
      options: [{ label: i18n.t('common:Yes'), value: 'true' }],
    },
    {
      key: 'tags',
      type: 'tagsSelect',
      label: i18n.t('label'),
      options: labelsList.map((item) => ({ ...item, value: item.id })),
    },
    {
      key: 'q',
      outside: true,
      label: 'title',
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Title') }),
      type: 'input',
    },
  ];

  return (
    <Row className="erda-list-select-overlay text-default-9 rounded">
      <Col span={12} className="px-2 h-full bg-default-02">
        <div className="erda-list-select-right-content flex">
          <div className="flex-1 pl-2 min-w-0">
            <div className="py-3 px-2 mb-2">
              <ConfigurableFilter
                hideSave
                value={filterData}
                fieldsList={fieldsList}
                onFilter={(values) => setFilterData(values)}
                onClear={() => {}}
              />
            </div>
            <div className="erda-list-select-list flex-1 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto">
                {releaseList?.map?.((item) => {
                  const checked = !!selectedList.find((listItem) => listItem.id === item.id);
                  return (
                    <div
                      className="px-2 py-3 rounded-sm cursor-pointer hover:bg-default-04 flex items-center"
                      onClick={() => select(item as Item, !checked)}
                      key={item.id}
                    >
                      <Radio multiple checked={checked} />
                      <div className="pl-3 flex-1 min-w-0 truncate">{renderItem(item as Item)}</div>
                    </div>
                  );
                })}

                {!releaseList.length ? (
                  <div className="h-full flex items-center justify-center flex-col">
                    <img src={empty} />
                    <div className="text-default-6 mt-2">
                      {i18n.t('dop:no {name}', { name: i18n.t('dop:App artifact') })}
                    </div>
                  </div>
                ) : null}
              </div>

              {listPagination ? <Pagination hidePageSizeChange {...listPagination} /> : null}
            </div>
          </div>
        </div>
      </Col>
      <Col span={12} className="px-2 h-full">
        <div className="py-3 px-2">
          {i18n.t('common:Selected')}
          {selectedList.length && selectedList.length !== 0 ? (
            <span className="selected-num ml-2 rounded-full">{selectedList.length}</span>
          ) : null}
        </div>
        <div className="erda-list-select-selected-list overflow-y-auto">
          {selectedList.map((item) => (
            <div
              className="erda-list-select-selected-item flex items-center p-2 hover:bg-default-04 rounded-sm"
              key={item.id}
            >
              <div className="flex-1 pr-2 min-w-0 truncate">{renderSelectedItem(item, false)}</div>
              <ErdaIcon
                type="close-small"
                size={24}
                className="erda-list-select-selected-item-delete cursor-pointer text-default-6"
                onClick={() => remove(item.id)}
              />
            </div>
          ))}
          {!selectedList.length ? (
            <div className="h-full flex items-center justify-center flex-col">
              <img src={empty} />
              <div className="text-default-6 mt-2">
                {i18n.t('dop:no choice {name}', { name: i18n.t('dop:App artifact') })}
              </div>
            </div>
          ) : null}
        </div>
        <div className="py-3 px-2 float-right">
          <Button className="mr-2" onClick={onCancel}>
            {i18n.t('Cancel')}
          </Button>
          <Button className="mr-2" onClick={clear}>
            {i18n.t('Clear with One Click')}
          </Button>
          <Button className="mr-2" type="primary" onClick={onOk}>
            {i18n.t('OK')}
          </Button>
        </div>
      </Col>
    </Row>
  );
};

const defaultRenderSelectedItem = (item: Item, isDark?: boolean) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1 min-w-0">
        <div
          className="text-purple-deep truncate cursor-pointer"
          title={item.version}
          onClick={() => goTo(goTo.resolve.applicationReleaseDetail({ releaseId: item.id }), { jumpOut: true })}
        >
          {item.version}
        </div>
        <div className="text-xs flex my-1">
          <div className={isDark ? 'text-white-6' : 'text-default-6'}>{i18n.t('dop:owned application')}</div>
          <div className="ml-2 flex-1 min-w-0 truncate" title={item.applicationName}>
            {item.applicationName}
          </div>
        </div>
      </div>
      <div className={isDark ? 'text-white-6' : 'text-default-6'}>
        {item.createdAt ? moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss') : null}
      </div>
    </div>
  );
};

const renderItem = (item: Item) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1 min-w-0">
        <div className="truncate" title={item.version}>
          {item.version}
        </div>
        <div className="text-xs flex">
          <div className="text-default-6">{i18n.t('dop:owned application')}</div>
          <div className="ml-2 truncate" title={item.applicationName}>
            {item.applicationName}
          </div>
        </div>
      </div>
      <span className="text-xs text-default-6">{moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss')}</span>
    </div>
  );
};

interface RadioProps {
  checked?: boolean;
  multiple?: boolean;
}

const Radio = ({ checked, multiple = false }: RadioProps) => {
  return multiple ? (
    <div
      className={`w-6 h-6 inline-block rounded-full border border-solid border-default-3 flex p-1 text-white ${
        checked ? 'bg-purple-deep border-purple-deep' : ''
      }`}
    >
      {checked ? <ErdaIcon type="check" /> : null}
    </div>
  ) : (
    <div
      className={`w-6 h-6 inline-block rounded-full border border-solid border-default-3 flex p-1 text-white ${
        checked ? 'border-purple-deep' : ''
      }`}
    >
      <div className={`inline-block flex-1 rounded-full ${checked ? 'bg-purple-deep' : ''}`} />
    </div>
  );
};

export default ReleaseSelect;
