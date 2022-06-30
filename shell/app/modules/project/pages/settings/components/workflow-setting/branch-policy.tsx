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
import { getBranchPolicy, updateBranchPolicy, BranchPolicy } from 'project/services/project-workflow';
import { useMount } from 'react-use';
import { EmptyHolder, ErdaIcon, Ellipsis } from 'common';
import { Button, Switch, Input, Select, Popconfirm, message, Tooltip, Spin } from 'antd';
import { uuid } from 'common/utils';
import { throttle, compact } from 'lodash';
import ResizeObserver from 'rc-resize-observer';
import { branchNameValidator, branchNameWithoutWildcard } from 'project/common/config';
import { WithAuth } from 'user/common';
import themeColor from 'app/theme-color.mjs';
import i18n from 'i18n';
interface IProps {
  projectId: string;
  editAuth: boolean;
}

enum BranchType {
  multiple = 'multi_branch',
  single = 'single_branch',
}

interface BranchPolicyData extends BranchPolicy {
  id: string;
  openTempMerge: boolean;
}

export const convertPolicyData = (d: BranchPolicy[]) =>
  d.map((item) => {
    return {
      ...item,
      id: uuid(),
      openTempMerge: !!item?.policy?.tempBranch,
      policy: item.policy && {
        ...item.policy,
        targetBranch: item.policy.targetBranch && {
          ...item.policy.targetBranch,
          cherryPick: item.policy.targetBranch.cherryPick || undefined,
        },
      },
    };
  });

const emptyId = uuid();
const emptyData = {
  id: emptyId,
  branch: '',
  openTempMerge: false,
  branchType: BranchType.single,
  policy: null,
};
const BranchPolicyList = ({ projectId, editAuth }: IProps) => {
  const [data, loading] = getBranchPolicy.useState();
  const [useData, setUseData] = React.useState<BranchPolicyData[]>(convertPolicyData(data?.branchPolicies || []));
  const [editData, setEditData] = React.useState<BranchPolicyData | null>(null);

  const getData = () => {
    return getBranchPolicy.fetch({ projectID: projectId });
  };

  useMount(() => {
    getData();
  });

  const deleteData = (_id: string) => {
    updateData(useData.filter((pItem) => pItem.id !== _id));
  };

  const saveData = (d: BranchPolicyData) => {
    const validMap = getValid(
      d,
      useData.filter((item) => item.id !== d.id),
    );
    const validStrArr = compact(Object.values(validMap));
    if (validStrArr.length) {
      message.warn(
        <div>
          {validStrArr.map((item) => {
            const [l, t] = item.split(tipSplit);
            return (
              <div key={item} className="py-1 flex-h-center">
                <span className="text-default-6 w-[100]">{`${l}:`}</span>

                <span className="text-red">{t}</span>
              </div>
            );
          })}
        </div>,
        1.5 * validStrArr.length,
      );
      return;
    }
    updateData(useData.map((item) => (item.id === d.id ? { ...d } : { ...item })));
  };

  const updateData = (policies: BranchPolicyData[]) => {
    if (data) {
      const rePolicies = policies.map((item) => {
        const { id, openTempMerge, ...rest } = item;
        return { ...rest };
      });
      updateBranchPolicy({ id: data.id, flows: data.flows, branchPolicies: rePolicies }).then(() => {
        getData().then(() => {
          message.success('更新成功');
          setEditData(null);
        });
      });
    }
  };

  React.useEffect(() => {
    setUseData(convertPolicyData(data?.branchPolicies || []));
  }, [data]);

  return (
    <Spin spinning={loading}>
      <div className="flex justify-end">
        <WithAuth pass={editAuth}>
          <Button
            type="primary"
            disabled={!!editData}
            onClick={() => {
              setUseData((prev) => [emptyData, ...prev]);
              setEditData({ ...emptyData });
            }}
          >
            新建
          </Button>
        </WithAuth>
      </div>
      {useData.map((item) => {
        const deleteCurData = () => {
          setUseData((prev) => prev.filter((pItem) => pItem.id !== item.id));
        };
        const editCurData = (d: BranchPolicyData) => {
          setUseData((prev) => prev.map((pItem) => (pItem.id === d.id ? d : pItem)));
        };
        return (
          <BranchPolicyItem
            key={item.id}
            fullData={useData}
            editAuth={editAuth}
            data={item}
            editId={editData?.id || ''}
            onEdit={() => setEditData({ ...item })}
            cancelEdit={() => {
              item.id === emptyId ? deleteCurData() : editData && editCurData(editData);
              setEditData(null);
            }}
            onDelete={() => deleteData(item.id)}
            onSave={saveData}
          />
        );
      })}
      {!useData.length ? <EmptyHolder relative /> : null}
    </Spin>
  );
};

const hasNoPolicy = (
  policy: null | {
    currentBranch: string;
    sourceBranch: string;
    tempBranch: string;
    targetBranch: null | undefined | { mergeRequest: string; cherryPick: string | undefined };
  },
  branchType: string,
) => {
  if (!policy) return true;
  if (branchType === BranchType.multiple) {
    const valueLen = compact(Object.values(policy)).length;
    return valueLen === 0 || (valueLen === 1 && policy.currentBranch);
  } else {
    return !policy.sourceBranch;
  }
};

const tipSplit = '_label_tip_';
const getValid = (policyData: BranchPolicyData, fullData: BranchPolicyData[]) => {
  const branchValidFun = (_label: string, _v?: string) => {
    let t = '';
    if (_v) {
      const [pass, tips] = branchNameValidator(_v);
      if (!pass) t = `${tips}`;
      if (!t && fullData.find((item) => item.branch === _v)) {
        t = `${_v} 已存在`;
      }
      return t ? `${_label}${tipSplit} ${t}` : '';
    }
    return `${_label}${tipSplit} 不能为空`;
  };
  const normalBranch = (_label: string, _v?: string, required?: boolean) => {
    let t = '';
    if (_v) {
      const [pass, tips] = branchNameWithoutWildcard(_v, false);
      t = !pass ? `${tips}` : '';
    } else if (required) {
      t = '不能为空';
    }
    return t ? `${_label}${tipSplit} ${t}` : '';
  };
  const rules = {
    sourceBranch: normalBranch,
    currentBranch: branchValidFun,
    branch: branchValidFun,
    tempBranch: (_label: string, _val?: string) => normalBranch(_label, _val, true),
    mergeRequest: normalBranch,
    cherryPick: (_label: string, _v?: string) => {
      let t = '';
      if (_v) {
        const [pass, tips] = branchNameWithoutWildcard(_v, true);
        t = !pass ? `${tips}` : '';
      }
      return t ? `${_label}${tipSplit} ${t}` : '';
    },
  };
  return {
    sourceBranch: rules.sourceBranch(
      '来源分支',
      policyData?.policy?.sourceBranch,
      policyData.branchType === BranchType.multiple,
    ),
    // currentBranch: branchValid rules.currentBranch('当前分支', policyData?.policy?.currentBranch),
    branch: rules.branch('分支', policyData?.branch),
    tempBranch: policyData?.openTempMerge ? rules.tempBranch('临时分支', policyData?.policy?.tempBranch) : '',
    mergeRequest: rules.mergeRequest(
      '目标分支',
      policyData?.policy?.targetBranch?.mergeRequest,
      policyData.branchType === BranchType.multiple,
    ),
    cherryPick: rules.cherryPick('pick 分支', policyData?.policy?.targetBranch?.cherryPick),
  };
};

export const BranchPolicyItem = ({
  data: propsData,
  editId,
  onEdit,
  cancelEdit,
  onSave,
  onDelete,
  editAuth = false,
}: {
  data: BranchPolicyData;
  editId?: string;
  onEdit?: () => void;
  cancelEdit?: () => void;
  fullData: BranchPolicyData[];
  editAuth?: boolean;
  onDelete?: () => void;
  onSave?: (d: BranchPolicyData) => void;
}) => {
  const [data, setData] = React.useState(propsData);
  const [lineWidth, setLineWidth] = React.useState(138);
  const { branch, policy, branchType } = data || {};
  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    setData(propsData);
  }, [propsData]);

  const setDataValue = (val: Obj) => {
    setData((prev) => ({ ...prev, ...val }));
  };

  const noPolicy = hasNoPolicy(policy, branchType);
  const isCreate = noPolicy && editId === data.id;

  const onResize = throttle(({ width }: { width: number }) => {
    const curW = (width - 600) / 2;
    setLineWidth(curW < 138 ? 138 : curW);
  }, 500);

  return (
    <ResizeObserver onResize={onResize}>
      <div className="border-all rounded mt-2 mb-4 group">
        <div className="px-4 py-2 flex-h-center border-bottom bg-default-02 justify-between ">
          <div className="flex-h-center">
            <ErdaIcon size={16} className="text-default-4" type="daimafenzhi" />
            {isCreate && noPolicy && !showAdd ? (
              <div>
                <Input
                  className="bg-default-06 border-none rounded py-0"
                  autoFocus
                  value={branch}
                  onChange={(e) => {
                    const val = e.target.value;
                    const _data = {
                      ...data,
                      branch: val,
                      branchType: val.endsWith('*') ? BranchType.multiple : BranchType.single,
                      policy: {
                        ...data.policy,
                        currentBranch: val,
                      },
                    };
                    setDataValue(_data);
                  }}
                />
              </div>
            ) : (
              <span className="ml-2 font-medium text-default">{branch}</span>
            )}
          </div>
          <If condition={editAuth}>
            {data.id === editId ? (
              <div>
                <span
                  className={'px-2 py-1 rounded  mr-2 cursor-pointer text-purple-deep hover:bg-purple-light'}
                  onClick={() => onSave?.(data)}
                >
                  保存
                </span>
                <span
                  className="cursor-pointer px-2 py-1 rounded text-default-8 hover:bg-default-1"
                  onClick={() => {
                    setShowAdd(false);
                    cancelEdit?.();
                  }}
                >
                  取消
                </span>
              </div>
            ) : (
              <div className="flex-h-center group-hover:visible invisible">
                <ErdaIcon
                  onClick={() => !editId && onEdit?.()}
                  size={18}
                  type="edit"
                  className={`font-medium  ${
                    editId ? 'text-default-3 cursor-not-allowed' : 'text-default-6 cursor-pointer hover:text-default-8'
                  }`}
                />
                <Popconfirm title={'是否确认删除'} disabled={!!editId} onConfirm={() => !editId && onDelete?.()}>
                  <ErdaIcon
                    size={18}
                    type="shanchu-4d7l02mb"
                    className={`font-medium ml-2 ${
                      editId
                        ? 'text-default-3 cursor-not-allowed'
                        : 'text-default-6 cursor-pointer hover:text-default-8'
                    }`}
                  />
                </Popconfirm>
              </div>
            )}
          </If>
        </div>
        {!noPolicy || showAdd ? (
          <div className="p-2">
            <div className="flex items-start overflow-x-auto p-2">
              <SourceBranchCard
                setData={setDataValue}
                editing={editId === data.id}
                data={data}
                className="flex-shrink-0"
              />
              <Line index={1} data={data} lineWidth={lineWidth} />
              <CurrentBranchCard
                setData={setDataValue}
                editing={editId === data.id}
                data={data}
                className="flex-shrink-0"
              />
              <If condition={data.branchType === BranchType.multiple}>
                <Line index={2} data={data} lineWidth={lineWidth} />
                <TargetBranchCard
                  setData={setDataValue}
                  editing={editId === data.id}
                  data={data}
                  className="flex-shrink-0"
                />
              </If>
            </div>
          </div>
        ) : !branch ? (
          <div />
        ) : (
          <EmptyHolder
            relative
            style={{ height: 100 }}
            tip={
              <div className="text-sm">
                {'该分支暂无分支策略'}
                <If condition={editAuth}>
                  {', '}
                  <span
                    onClick={() => {
                      setShowAdd(true);
                      const d = {
                        ...data,
                        policy: { sourceBranch: '', ...data.policy, currentBranch: data.branch },
                      };
                      setDataValue(d);
                      onEdit?.();
                    }}
                    className="text-purple-deep cursor-pointer"
                  >
                    点击添加
                  </span>
                </If>
              </div>
            }
          />
        )}
      </div>
    </ResizeObserver>
  );
};

interface CardProps {
  data: BranchPolicyData;
  className?: string;
  editing: boolean;
  setData: (v: BranchPolicyData) => void;
}
const SourceBranchCard = (props: CardProps) => {
  const { data, className, editing, setData } = props;

  return (
    <div className={`flex-col w-[180px] ${className}`}>
      <div className="text-default-4 mr-2 text-center mb-2 flex-h-center justify-center">
        {'来源分支'}
        <Tooltip
          title={`${i18n.t('dop:Merge change branch')}, ${i18n.t(
            'start with letters and can contain characters that are not wildcard',
          )}`}
        >
          <ErdaIcon type="help" className="ml-1 cursor-pointer" />
        </Tooltip>
      </div>
      {editing ? (
        <>
          <Input
            autoFocus
            placeholder={i18n.t('start with letters and can contain characters that are not wildcard')}
            className="bg-default-06 border-none rounded"
            value={data?.policy?.sourceBranch}
            onChange={(e) => setData({ ...data, policy: { ...data.policy, sourceBranch: e.target.value } })}
          />
        </>
      ) : (
        <Ellipsis
          className="text-default-8 bg-default-06 rounded px-[11px] py-1 hover:bg-default-1 cursor-pointer h-[30px]"
          title={data?.policy?.sourceBranch}
        />
      )}
    </div>
  );
};

const BranchInput = ({ value, type, onChange }: { value: string; type: string; onChange: (v: Obj) => void }) => {
  const val = (value || '').split('/')[0];
  return (
    <div>
      <div className="flex-h-center">
        <Input
          className="bg-default-06 border-none flex-1 rounded"
          value={val}
          onChange={(e) =>
            onChange({ type, value: type === BranchType.multiple ? `${e.target.value}/*` : e.target.value })
          }
        />
        <span className="px-1 text-base">/</span>
        <Select
          bordered={false}
          className="bg-default-06 w-[75px] h-[30px] rounded"
          value={type}
          onChange={(v) => onChange({ type: v, value: v === BranchType.multiple ? `${val}/*` : val })}
        >
          <Select.Option value={BranchType.single}>无</Select.Option>
          <Select.Option value={BranchType.multiple}>*</Select.Option>
        </Select>
      </div>
    </div>
  );
};

const CurrentBranchCard = (props: CardProps) => {
  const { data, className, editing, setData } = props;

  return (
    <div className={`flex-col w-[180px] ${className}`}>
      <div className="text-default-4 mr-2 text-center mb-2">
        <If condition={editing}>
          <span data-required="* " className="ml-1 before:required" />
        </If>
        {'当前分支'}
        <Tooltip
          title={
            <div>
              <div>{i18n.t('dop:A branch for feature development')}</div>
              <div className="mt-1">{`${'当前分支'}: 字母开头，可包含:数字 _ - . / $ # @，结尾可带*`}</div>
              <div className="mt-1">{`${'临时分支'}:${i18n.t(
                'start with letters and can contain characters that are not wildcard',
              )}`}</div>
            </div>
          }
        >
          <ErdaIcon type="help" className="ml-1 cursor-pointer" />
        </Tooltip>
      </div>
      {editing ? (
        <>
          <BranchInput
            value={data?.policy?.currentBranch || ''}
            type={data?.branchType}
            onChange={(val) => {
              setData({
                ...data,
                branch: val.value,
                branchType: val.type,
                policy: {
                  ...data.policy,
                  currentBranch: val.value,
                },
              });
            }}
          />
        </>
      ) : (
        <div className="text-default-8 bg-default-06 rounded px-2 py-1 hover:bg-default-1 cursor-pointer">
          {data?.policy?.currentBranch || ' '}
        </div>
      )}
      <If condition={data.branchType === BranchType.multiple}>
        <div className="flex-col mt-2">
          <div className="flex-h-center">
            <span className="text-default-6 mr-2">临时合并</span>
            <Switch
              checked={data.openTempMerge}
              unCheckedChildren="关闭"
              checkedChildren="开启"
              onChange={(c) => editing && setData({ ...data, openTempMerge: c })}
            />
          </div>
          <If condition={data.openTempMerge}>
            {editing ? (
              <Input
                autoFocus
                className="bg-default-06 border-none mt-2 rounded"
                value={data?.policy?.tempBranch}
                onChange={(e) =>
                  setData({
                    ...data,
                    policy: { ...data.policy, tempBranch: e.target.value },
                  })
                }
              />
            ) : (
              <Ellipsis
                className="text-default-8 bg-default-06 rounded  px-[11px] mt-2 py-1 hover:bg-default-1 cursor-pointer h-[30px]"
                title={data?.policy?.tempBranch || ' '}
              />
            )}
          </If>
        </div>
      </If>
    </div>
  );
};

const TargetBranchCard = (props: CardProps) => {
  const { data, className, editing, setData } = props;
  const { mergeRequest, cherryPick } = data?.policy?.targetBranch || {};
  const [pickBranchArr, setPickBranchArr] = React.useState<string[]>([]);

  React.useEffect(() => {
    const _pickBranchArr = cherryPick !== undefined ? cherryPick.split(',') : [];
    setPickBranchArr(_pickBranchArr);
  }, [cherryPick]);
  const setPick = (v: string | undefined, idx: number) => {
    let strArr = [];
    if (idx > pickBranchArr.length - 1) {
      strArr = [...pickBranchArr, ''];
    } else {
      strArr =
        v === undefined
          ? pickBranchArr.filter((_, _idx) => _idx !== idx)
          : pickBranchArr.map((item, _idx) => (_idx === idx ? v : item));
    }
    setData({
      ...data,
      policy: {
        ...data.policy,
        targetBranch: {
          mergeRequest: '',
          ...data?.policy?.targetBranch,
          cherryPick: strArr.length ? strArr.join(',') : undefined,
        },
      },
    });
  };

  return (
    <div className={`flex-col w-[180px] ${className} `}>
      <div className="text-default-4 mr-2 text-center mb-2">
        {'目标分支'}
        <Tooltip
          title={
            <div>
              <div>{i18n.t('dop:Create a change branch based on that branch')}</div>
              <div className="mt-1">{`${'目标分支'}: ${i18n.t(
                'start with letters and can contain characters that are not wildcard',
              )}`}</div>
              <div className="mt-1">{`${'pick 分支'}:${i18n.t(
                'start with letters and can contain characters that are not wildcard',
              )}`}</div>
            </div>
          }
        >
          <ErdaIcon type="help" className="ml-1 cursor-pointer" />
        </Tooltip>
      </div>
      {editing ? (
        <Input
          autoFocus
          className="bg-default-06 border-none rounded"
          value={mergeRequest}
          onChange={(e) =>
            setData({
              ...data,
              policy: {
                ...data.policy,
                targetBranch: {
                  ...data?.policy?.targetBranch,
                  mergeRequest: e.target.value,
                },
              },
            })
          }
        />
      ) : (
        <Ellipsis
          className="text-default-8 bg-default-06 rounded px-[11px] py-1 hover:bg-default-1 cursor-pointer h-[30px]"
          title={mergeRequest || ' '}
        />
      )}

      {pickBranchArr.map((item, idx) => {
        return !editing ? (
          <div
            key={idx}
            className="mt-2 text-default-8 bg-default-06 rounded px-2 py-1 hover:bg-default-1 cursor-pointer"
          >
            {item}
          </div>
        ) : (
          <div className="relative" key={idx}>
            <Input
              autoFocus
              className="bg-default-06 border-none rounded mt-2"
              value={item}
              onChange={(e) => setPick(e.target.value, idx)}
            />
            <div
              className="p-[3px] absolute right-[-28px] w-[22px] h-[22px] rounded hover:bg-default-06 top-[12px] cursor-pointer"
              onClick={() => setPick(undefined, idx)}
            >
              <ErdaIcon size={16} type="shanchu" className="text-default-4 hover:text-default-6" />
            </div>
          </div>
        );
      })}
      {editing ? (
        <div
          className="mt-2 text-center bg-default-06 rounded px-2 py-1 hover:bg-default-1 cursor-pointer flex-h-center justify-center"
          onClick={() => {
            setPick('', pickBranchArr.length);
          }}
        >
          <ErdaIcon type="plus" size={18} className="text-purple-deep" />
        </div>
      ) : null}
    </div>
  );
};

// draw line
const Line = ({ index, data, lineWidth }: { index: number; data: BranchPolicy; lineWidth: number }) => {
  const baseConfig = {
    width: lineWidth,
    top: 30,
    height: 30,
    distance: 5,
    margin: 8,
    markedWidth: 7,
  };
  const { width, top, height, distance, margin, markedWidth } = baseConfig;
  const getLinePostion = () => {
    if (index === 1) {
      const pos = { x1: distance, y1: height / 2 + top, x2: width - distance - markedWidth, y2: height / 2 + top };
      const _id = uuid();
      return (
        <svg key={'1'} width={width} height={top + height}>
          <defs>
            <marker id={`markerEnd${_id}`} markerWidth={14} markerHeight={14} refX={2} refY={6}>
              <path d="M2,2 L2,11 L10,6 L2,2" fill={themeColor['light-gray']} />
            </marker>
          </defs>
          <line
            {...pos}
            style={{ stroke: themeColor['light-gray'], strokeWidth: '1px', markerEnd: `url(#markerEnd${_id})` }}
          />
          <text x={(pos.x2 + pos.x1) / 2 - 10} y={pos.y1 - 10} fill={themeColor['default-6']} style={{ fontSize: 12 }}>
            {'pull'}
          </text>
        </svg>
      );
    } else {
      const { cherryPick } = data.policy?.targetBranch || {};
      const pickLen = cherryPick !== undefined ? cherryPick.split(',').length : 0;
      const pos = { x1: distance, y1: height / 2 + top, x2: width - distance - markedWidth, y2: height / 2 + top };
      const _id = uuid();
      return (
        <svg key={'1'} width={width} height={top + height + pickLen * (height + margin)}>
          <defs>
            <marker id={`markerEnd1_${_id}`} markerWidth={14} markerHeight={14} refX={2} refY={6}>
              <path d="M2,2 L2,11 L10,6 L2,2" fill={themeColor['light-gray']} />
            </marker>
            <marker id={`markerEnd2_${_id}`} markerWidth={14} markerHeight={14} refX={2} refY={6}>
              <path d="M2,2 L2,11 L10,6 L2,2" fill={themeColor['light-gray']} />
            </marker>
          </defs>
          <g>
            <line
              {...pos}
              style={{ stroke: themeColor['light-gray'], strokeWidth: '1px', markerEnd: `url(#markerEnd1_${_id})` }}
            />
            <text
              x={(pos.x2 + pos.x1) / 2 - 10}
              y={pos.y1 - 10}
              fill={themeColor['default-6']}
              style={{ fontSize: 12 }}
            >
              {'merge'}
            </text>
          </g>
          {new Array(pickLen).fill('').map((_, idx) => {
            const [d, textPos] = getCPath(
              distance,
              height / 2 + top,
              width - distance - markedWidth,
              height / 2 + top + (idx + 1) * (height + margin),
            );
            return (
              <g key="idx">
                <path
                  key={idx}
                  stroke={themeColor['light-gray']}
                  fill="transparent"
                  d={d}
                  style={{ markerEnd: `url(#markerEnd2_${_id})` }}
                />
                <text x={textPos?.x} y={textPos?.y} fill={themeColor['default-6']} style={{ fontSize: 12 }}>
                  {'pick'}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }
  };
  const lines = <div className="relative">{getLinePostion()}</div>;

  return <div style={{ width: lineWidth }}>{lines}</div>;
};

// berzier path count
const getCPath = (x1: number, y1: number, x2: number, y2: number) => {
  let path = `M${x1} ${y1} `;
  const c = `C ${x1} ${y1}, ${qBerzier([x1, y1], [(x1 + x2) / 2, y1], [(x2 + x1) / 2, (y2 + y1) / 2], 0.3)},${
    (x2 + x1) / 2
  } ${(y2 + y1) / 2}C${(x2 + x1) / 2} ${(y2 + y1) / 2},${qBerzier(
    [(x2 + x1) / 2, (y2 + y1) / 2],
    [(x1 + x2) / 2, y2],
    [x2, y2],
    0.7,
  )},${x2} ${y2}`;

  return [`${path}${c}`, { x: (x2 + x1) / 2 - 10, y: y2 === y1 ? y1 - 10 : (y2 + y1) / 2 }];
};

// bersier formula
const qBerzier = (p0: number[], p1: number[], p2: number[], t: number) => {
  const x = (1 - t) * (1 - t) * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0];
  const y = (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1];
  return `${x} ${y}`;
};

export default BranchPolicyList;
