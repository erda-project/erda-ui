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

import React, { useState, useEffect } from 'react';
import i18n from 'i18n';
import { map, reduce, forEach, round, isEmpty, filter, get } from 'lodash';
import classnames from 'classnames';
import { Row, Col, Select, Tooltip, message, TreeSelect, Spin } from 'app/nusi';
import { useComponentWidth } from 'app/common/components/use-hooks';
import { IF, Holder, Icon as CustomIcon } from 'common';
import { goTo } from 'common/utils';
import GroupTabs from './groupTabs';
import MachineTabs from './machineTabs';
import { COLOUR_MAP } from '../../common/config';
import clusterDashboardStore from '../../stores/dashboard';
import { useLoading } from 'app/common/stores/loading';
import { useMount, useUnmount } from 'react-use';
import { stateSeverityMap } from 'dataCenter/pages/cluster-manage/cluster-state';
import './index.scss';

const { TreeNode } = TreeSelect;
const { Option } = Select;

const commonColorMap = {
  'colour-degree-1': { text: '0%-40%', range: [0, 40] },
  'colour-degree-2': { text: '40%-70%', range: [40, 70] },
  'colour-degree-3': { text: '70%-99%', range: [70, 99] },
  'colour-degree-4': { text: '>=99%', range: [99] },
};

const systemLoadColorMap = {
  'colour-degree-1': { text: '0%-150%', range: [0, 150] },
  'colour-degree-2': { text: '150%-200%', range: [150, 200] },
  'colour-degree-3': { text: '200%-250%', range: [200, 250] },
  'colour-degree-4': { text: '>=250%', range: [250] },
};

const DEGREE_COLOUR_MAP = {
  load: systemLoadColorMap,
  cpu: commonColorMap,
  mem: commonColorMap,
  disk: commonColorMap,
  scheduledCPU: commonColorMap,
  scheduledMEM: commonColorMap,
};

const UNIT_MAP = {
  cluster: '',
  mem: 'GB',
  cpus: 'Core',
};

const getDegreeColourClass = (value: number, type: string) => {
  const colorMap = DEGREE_COLOUR_MAP[type] || commonColorMap;
  let degreeColourClass = '';
  if (value > colorMap['colour-degree-4'].range[0]) {
    degreeColourClass = 'colour-degree-4';
  } else if (value > colorMap['colour-degree-3'].range[0]) {
    degreeColourClass = 'colour-degree-3';
  } else if (value > colorMap['colour-degree-2'].range[0]) {
    degreeColourClass = 'colour-degree-2';
  } else {
    degreeColourClass = 'colour-degree-1';
  }

  return degreeColourClass;
};

const getGroupGridClass = (containerWidth: number) => {
  let gridClass = 'machine-group-ct-g1';
  if (containerWidth > 1440) {
    gridClass = 'machine-group-ct-g3';
  } else if (containerWidth > 800) {
    gridClass = 'machine-group-ct-g2';
  }

  return gridClass;
};

const getSubGroupGridClass = (containerWidth: number) => {
  let gridClass = 'machine-group-ct-g1';
  if (containerWidth > 800) {
    gridClass = 'machine-group-ct-g4';
  } else if (containerWidth > 500) {
    gridClass = 'machine-group-ct-g3';
  } else if (containerWidth > 300) {
    gridClass = 'machine-group-ct-g2';
  }

  return gridClass;
};

const getMachineGridClass = (containerWidth: number) => {
  let gridClass = 'machine-list-ct-g1';
  if (containerWidth > 1440) {
    gridClass = 'machine-list-ct-g40';
  } else if (containerWidth > 1200) {
    gridClass = 'machine-list-ct-g36';
  } else if (containerWidth > 840) {
    gridClass = 'machine-list-ct-g32';
  } else if (containerWidth > 760) {
    gridClass = 'machine-list-ct-g28';
  } else if (containerWidth > 600) {
    gridClass = 'machine-list-ct-g24';
  } else if (containerWidth > 480) {
    gridClass = 'machine-list-ct-g20';
  } else if (containerWidth > 400) {
    gridClass = 'machine-list-ct-g16';
  } else if (containerWidth > 280) {
    gridClass = 'machine-list-ct-g12';
  } else if (containerWidth > 200) {
    gridClass = 'machine-list-ct-g8';
  } else if (containerWidth > 120) {
    gridClass = 'machine-list-ct-g6';
  } else if (containerWidth > 60) {
    gridClass = 'machine-list-ct-g4';
  }

  return gridClass;
};

const SubMachineGroup = ({
  groupName,
  unitGroups,
  groups,
  activeMachine,
  setActivedMachine,
  setActivedGroup,
  getMachineColourClass,
  getMachineColourValue,
}: {
  groupName: string | null;
  unitGroups: string[];
  groups?: ORG_DASHBOARD.IGroupInfo[];
  activeMachine: any;
  setActivedMachine: (payload: any) => void;
  setActivedGroup: (subGroupName: string) => void;
  getMachineColourClass: (machineInfo: any) => string;
  getMachineColourValue: (machineInfo: any) => { name: string; value: number };
}) => {
  const [subMachineContainerWidthHolder, setSubMachineContainerWidth] = useComponentWidth();
  const [subGroupContainerWidthHolder, subGroupContainerWidth] = useComponentWidth();
  const [subMachineGridClass, setSubMachineGridClass] = useState('machine-list-ct-g4');
  const [subGroupGridClass, setSubGroupGridClass] = useState('machine-group-ct-g2');

  useEffect(() => {
    if (setSubMachineContainerWidth !== Infinity) {
      setSubMachineGridClass(getMachineGridClass(setSubMachineContainerWidth as number));
    }
  }, [setSubMachineContainerWidth]);

  useEffect(() => {
    if (subGroupContainerWidth !== Infinity) {
      setSubGroupGridClass(getSubGroupGridClass(subGroupContainerWidth as number));
    }
  }, [subGroupContainerWidth]);
  return (
    <>
      {subGroupContainerWidthHolder}
      <div className={`machine-group-ct sub-machine-group-ct ${subGroupGridClass}`}>
        {/* <Spin spinning={!subGroupGridClass}> */}
        {map(groups, ({ name: subGroupName, metric: subMetric, machines: subMachines }) => (
          <div
            key={subGroupName}
            className="machine-group sub-machine-group"
            onClick={(e) => {
              e.stopPropagation();
              setActivedGroup(`${groupName + unitGroups[0]}-${subGroupName + unitGroups[1]}`);
            }}
          >
            {subMachineContainerWidthHolder}
            <div className="group-header flex-box">
              <h3 className="group-title">{subGroupName + unitGroups[1]}</h3>
              <span className="group-actived-op hover-active">
                <CustomIcon type="grow" />
              </span>
            </div>
            <Holder when={!subMachines.length}>
              <p className="group-info">
                <span>
                  {i18n.t('machines')}：{subMetric.machines}
                </span>
              </p>
              <div
                className={classnames({
                  'machine-list-ct': true,
                  [`${subMachineGridClass}`]: true,
                  'machine-actived': !!activeMachine.ip,
                })}
              >
                {map(subMachines, ({ ip, clusterName, ...rest }) => {
                  const { name: colourName, value: colourValue } = getMachineColourValue(rest);
                  return (
                    <Tooltip
                      placement="bottom"
                      title={`${ip} (${colourName}: ${colourValue}%)`}
                      key={`${clusterName}-${ip}`}
                    >
                      <div
                        className={classnames({
                          'machine-item': true,
                          'hover-active': true,
                          [`${getMachineColourClass(rest)}`]: true,
                          active: ip === activeMachine.ip && clusterName === activeMachine.clusterName,
                        })}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivedMachine({ ip, clusterName, ...rest });
                        }}
                      >
                        <span
                          className="cancel-active"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivedMachine({});
                          }}
                        >
                          <CustomIcon type="gb" />
                        </span>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </Holder>
          </div>
        ))}
        {/* </Spin> */}
      </div>
    </>
  );
};

const ClusterDashboard = () => {
  const [filterGroup, groupInfos, unGroupInfo, clusterList, selectedGroups] = clusterDashboardStore.useStore((s) => [
    s.filterGroup,
    s.groupInfos,
    s.unGroupInfo,
    s.clusterList,
    s.selectedGroups,
  ]);
  const { getFilterTypes, getGroupInfos } = clusterDashboardStore.effects;
  const { setSelectedGroups } = clusterDashboardStore.reducers;
  const [loading] = useLoading(clusterDashboardStore, ['getGroupInfos']);

  const [groupContainerWidthHolder, groupContainerWidth] = useComponentWidth();
  const [machineContainerWidthHolder, machineContainerWidth] = useComponentWidth();
  const [groupGridClass, setGroupGridClass] = useState();
  const [machineGridClass, setMachineGridClass] = useState('machine-list-ct-g4');
  const [selectedFilters, setSelectedFilters] = useState();
  const [selectedColour, setSelectedColour] = useState('load');
  const [activeMachine, setActivedMachine] = useState({ ip: '', clusterName: '' });
  const [activeMachineTab, setActivedMachineTab] = useState();
  const [activedGroup, setActivedGroup] = useState('');
  const [groupMap, setGroupMap] = useState({});
  const [allMachines, setAllMachines] = useState();
  const [activeMachineList, setActivedMachineList] = useState();
  const [colorMark, setColorMark] = React.useState('load');
  const [isClickState, setIsClickState] = React.useState(false);

  useMount(() => {
    getFilterTypes();
  });

  useUnmount(() => {
    setSelectedGroups([]);
  });

  useEffect(() => {
    if (!isEmpty(clusterList)) {
      getGroupInfos({
        groups: selectedGroups,
        clusters: map(clusterList, (cl: any) => ({ clusterName: cl.name })),
        filters: getFilters(selectedFilters),
      });
    }
  }, [clusterList, getGroupInfos, selectedFilters, selectedGroups]);

  const unitGroups = React.useMemo(() => {
    const tempList = [...selectedGroups, '', ''].slice(0, 2);
    return tempList.map((item) => UNIT_MAP[item] || '');
  }, [selectedGroups]);

  useEffect(() => {
    const groupInfoMap = reduce(
      groupInfos,
      (result, item) => {
        let subResult = {};
        if (item.groups) {
          subResult = reduce(
            item.groups,
            (acc, subItem) => ({
              ...acc,
              [`${item.name + unitGroups[0]}-${subItem.name + unitGroups[1]}`]: subItem,
            }),
            {},
          );
        }

        return {
          ...result,
          ...subResult,
          [item.name + unitGroups[0]]: item,
        };
      },
      {},
    );
    setGroupMap(groupInfoMap);
  }, [groupInfos, unitGroups]);

  useEffect(() => {
    if (isEmpty(groupInfos)) {
      setAllMachines(unGroupInfo.machines || []);
    } else {
      let results: any[] = [];
      const getAllMachines = (groups: ORG_DASHBOARD.IGroupInfo[]) => {
        forEach(groups, ({ groups: subGroups, machines }: ORG_DASHBOARD.IGroupInfo) => {
          if (isEmpty(subGroups)) {
            results = [...results, ...(machines || [])];
          } else {
            getAllMachines(subGroups || []);
          }
        });
      };

      getAllMachines(groupInfos);
      setAllMachines(results);
    }
  }, [unGroupInfo.machines, groupInfos]);

  useEffect(() => {
    if (!activedGroup) {
      return setActivedMachineList(allMachines);
    }

    let machineList: any[] = [];
    if (isEmpty(groupMap[activedGroup])) {
      setActivedMachineList(machineList);
      return;
    }
    const { groups, machines } = groupMap[activedGroup];
    if (!isEmpty(groups)) {
      machineList = reduce(groups, (result, { machines: subMachines }) => [...result, ...subMachines], []);
    } else {
      machineList = machines || [];
    }
    setActivedMachineList(machineList);
  }, [activedGroup, allMachines, groupMap]);

  useEffect(() => {
    if (groupContainerWidth !== Infinity) {
      setGroupGridClass(getGroupGridClass(groupContainerWidth as number));
    }
  }, [groupContainerWidth]);

  useEffect(() => {
    if (machineContainerWidth !== Infinity) {
      setMachineGridClass(getMachineGridClass(machineContainerWidth as number));
    }
  }, [machineContainerWidth]);

  const getFilters = (filters: string[]) => {
    const filterMap = {};
    forEach(filters, (item) => {
      const [key, value] = item.split(':');
      filterMap[key] = filterMap[key] ? [...filterMap[key], value] : [value];
    });
    return map(filterMap, (values, key) => ({ key, values }));
  };

  const getMachineColourValue = ({
    cpuUsage,
    cpuAllocatable,
    memUsage,
    memAllocatable,
    diskUsage,
    diskTotal,
    cpuRequest,
    memRequest,
    load5,
  }: any) => {
    const getPercent = (used: number, total: number) => round((used / total) * 100, 2);
    const machineColourNameMap = {
      load: {
        name: COLOUR_MAP.load,
        value: load5,
      },
      cpu: {
        name: COLOUR_MAP.cpu,
        value: getPercent(cpuUsage, cpuAllocatable),
      },
      mem: {
        name: COLOUR_MAP.mem,
        value: getPercent(memUsage, memAllocatable),
      },
      disk: {
        name: COLOUR_MAP.disk,
        value: getPercent(diskUsage, diskTotal),
      },
      scheduledCPU: {
        name: COLOUR_MAP.scheduledCPU,
        value: getPercent(cpuRequest, cpuAllocatable),
      },
      scheduledMEM: {
        name: COLOUR_MAP.scheduledMEM,
        value: getPercent(memRequest, memAllocatable),
      },
    };
    return machineColourNameMap[selectedColour];
  };

  const getMachineColourClass = (machineInfo: Partial<ORG_MACHINE.IMachine>) =>
    getDegreeColourClass(getMachineColourValue(machineInfo).value, selectedColour);

  const handleChangeGroups = (groups: string[]) => {
    if (groups.length > 2) {
      message.warning(i18n.t('dcos:up to 2 optional groups'));
      return;
    }
    setActivedGroup('');
    setSelectedGroups(groups);
  };

  const handleChangeFilters = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const handleActiveMachine = (record: any, key?: string) => {
    setActivedMachine(record);
    setActivedMachineTab(key);
  };

  const getMachineGroupContent = (item: ORG_DASHBOARD.IGroupInfo) => {
    if (isEmpty(item)) return null;

    const { name: groupName, machines, metric, groups, clusterStatus }: ORG_DASHBOARD.IGroupInfo = item;

    const {
      machines: machineNum,
      cpuUsage,
      cpuAllocatable,
      memUsage,
      memAllocatable,
      diskUsage,
      diskTotal,
    } = metric || {};

    return (
      <Holder when={isEmpty(machines) && isEmpty(groups)}>
        <IF check={selectedGroups.length}>
          <div className="group-header flex-box">
            <h3 className="group-title">{activedGroup || groupName + unitGroups[0]}</h3>
            <IF check={activedGroup}>
              <span className="group-unactived-op hover-active">
                <CustomIcon type="shink" />
              </span>
              <IF.ELSE />
              <span className="group-actived-op hover-active">
                <CustomIcon type="grow" />
              </span>
            </IF>
          </div>
        </IF>
        <IF check={selectedGroups.length}>
          <div className="my8">
            <span
              className="cluster-state-link"
              onClick={() =>
                goTo(goTo.pages.dataCenterClusterState, { clusterName: activedGroup || groupName + unitGroups[0] })
              }
            >
              <span className="mr20">{i18n.t('dcos:global state of cluster')}:</span>
              <span>{get(stateSeverityMap, `${clusterStatus}.icon`)}</span>
              <span>{get(stateSeverityMap, `${clusterStatus}.displayName`)}</span>
            </span>
          </div>
        </IF>
        <p className="group-info">
          <span>
            {i18n.t('machines')}：{machineNum}
          </span>
          <span>CPU：{round((cpuUsage / cpuAllocatable) * 100, 2)}%</span>
          <span>
            {i18n.t('memory')}：{round((memUsage / memAllocatable) * 100, 2)}%
          </span>
          <span>
            {i18n.t('disk')}：{round((diskUsage / diskTotal) * 100, 2)}%
          </span>
        </p>
        <IF check={!isEmpty(groups)}>
          <SubMachineGroup
            groups={groups}
            unitGroups={unitGroups}
            groupName={groupName}
            activeMachine={activeMachine}
            setActivedMachine={setActivedMachine}
            setActivedGroup={setActivedGroup}
            getMachineColourClass={getMachineColourClass}
            getMachineColourValue={getMachineColourValue}
          />
          <IF.ELSE />
          <div
            className={classnames({
              'machine-list-ct': true,
              [`${machineGridClass}`]: true,
              'machine-actived': !!activeMachine.ip,
            })}
          >
            {map(machines, ({ ip, clusterName, ...rest }) => {
              const { name: colourName, value: colourValue } = getMachineColourValue(rest);
              return (
                <Tooltip
                  placement="bottom"
                  title={`${ip} (${colourName}: ${colourValue}%)`}
                  key={`${clusterName}-${ip}`}
                >
                  <div
                    className={classnames({
                      'machine-item': true,
                      'hover-active': true,
                      [`${getMachineColourClass(rest)}`]: true,
                      active: ip === activeMachine.ip && clusterName === activeMachine.clusterName,
                    })}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivedMachine({ ip, clusterName, ...rest });
                    }}
                  >
                    <span
                      className="cancel-active"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivedMachine({});
                      }}
                    >
                      <CustomIcon type="gb" />
                    </span>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </IF>
      </Holder>
    );
  };

  const getMachineGroupWrapper = (item?: ORG_DASHBOARD.IGroupInfo, gridClass?: any) => {
    return (
      <div
        key={item && item.name ? item.name : ''}
        className={classnames({
          'machine-group': true,
          'actived-machine-group': !!activedGroup,
          'no-machine-group': isEmpty(selectedGroups) || isEmpty(item),
        })}
        onClick={(e) => {
          if (isEmpty(selectedGroups) || isEmpty(item)) return;
          e.stopPropagation();
          setIsClickState(!isClickState);
          setActivedGroup(activedGroup ? '' : (item && item.name ? item.name : '') + unitGroups[0]);
        }}
      >
        <Holder when={isEmpty(item) || !gridClass}>{getMachineGroupContent(item)}</Holder>
        {machineContainerWidthHolder}
      </div>
    );
  };

  const Bottom = React.useMemo(
    () => (
      <IF check={activeMachine.ip}>
        <div className="content-title mb8">{activeMachine.ip}</div>
        <MachineTabs activeMachine={activeMachine} activeMachineTab={activeMachineTab} />
        <IF.ELSE />
        <GroupTabs
          activedGroup={activedGroup}
          machineList={activeMachineList}
          onActiveMachine={handleActiveMachine}
          isClickState={isClickState}
        />
      </IF>
    ),
    [activeMachine, activeMachineList, activeMachineTab, activedGroup, isClickState],
  );

  const handleOptionMouseEnter = (value: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setColorMark(value);
  };

  const handleSelectedColour = (val: string) => {
    setSelectedColour(val);
    setColorMark(val);
  };

  return (
    <>
      <div className="cluster-dashboard-top">
        <div className="filter-group-ct mb16">
          <Row gutter={20}>
            <Col span={8} className="filter-item flex-box">
              <div className="filter-item-label">{i18n.t('Group')}</div>
              <Select
                value={selectedGroups}
                placeholder={i18n.t('org:no more than 2 groups')}
                className="filter-item-content"
                style={{ width: '100%' }}
                showArrow
                allowClear
                mode="multiple"
                onChange={handleChangeGroups}
              >
                {map(
                  filter(filterGroup, ({ key: group }) => ['cpus', 'mem', 'cluster'].includes(group)),
                  ({ key, name }) => (
                    <Option key={key}>{name}</Option>
                  ),
                )}
              </Select>
            </Col>
            <Col span={8} className="filter-item flex-box">
              <div className="filter-item-label">{i18n.t('filter')}</div>
              <TreeSelect
                className="filter-item-content"
                style={{ width: '100%' }}
                value={selectedFilters}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                allowClear
                multiple
                // treeDefaultExpandAll
                placeholder={i18n.t('org:input to search')}
                onChange={handleChangeFilters}
              >
                {map(filterGroup, ({ name, key, values, unit, prefix }: ORG_DASHBOARD.IFilterType) => (
                  <TreeNode className="filter-item-node" title={`${name}（${key}）`} key={key} value={key} disabled>
                    {map(values, (subItem: any) => (
                      <TreeNode
                        value={`${key}:${subItem}`}
                        title={`${prefix ? `${prefix}：` : ''}${subItem} ${unit || ''}`}
                        key={`${key}-${subItem}`}
                      />
                    ))}
                  </TreeNode>
                ))}
              </TreeSelect>
            </Col>
            <Col span={8} className="filter-item flex-box">
              <div className="filter-item-label">{i18n.t('colour')}</div>
              <Select
                className="filter-item-content"
                style={{ width: '100%' }}
                value={selectedColour}
                onChange={handleSelectedColour}
                dropdownRender={(menu) => {
                  return (
                    <div className="colour-select-dropdown">
                      <div className="menu">{menu}</div>
                      <div className="comments">
                        <ul className="colour-comment-list">
                          {map(DEGREE_COLOUR_MAP[colorMark], (value, color) => (
                            <li className="colour-comment-item flex-box" key={color}>
                              <span className="colour-comment-value">{value.text}</span>
                              <div className={`color-block ${color}`} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }}
              >
                {map(COLOUR_MAP, (name, key) => (
                  <Option value={key} key={key}>
                    <div
                      onMouseEnter={(e) => {
                        handleOptionMouseEnter(key, e);
                      }}
                    >
                      {name}
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        {groupContainerWidthHolder}
        <Spin spinning={!groupGridClass || loading}>
          <IF check={isEmpty(selectedGroups) || isEmpty(groupInfos)}>
            <div className="machine-group-ct machine-group-ct-g1">
              {getMachineGroupWrapper(unGroupInfo, groupGridClass)}
            </div>
            <IF.ELSE />
            <div className={`machine-group-ct ${activedGroup ? 'machine-group-ct-g1' : groupGridClass}`}>
              <IF check={activedGroup}>
                {getMachineGroupWrapper(groupMap[activedGroup], groupGridClass)}
                <IF.ELSE />
                <IF check={!groupGridClass}>
                  {getMachineGroupWrapper()}
                  <IF.ELSE />
                  {map(groupInfos, (item) => getMachineGroupWrapper(item, true))}
                </IF>
              </IF>
            </div>
          </IF>
        </Spin>
      </div>
      <div className="cluster-dashboard-bottom">{Bottom}</div>
    </>
  );
};

export default ClusterDashboard;
