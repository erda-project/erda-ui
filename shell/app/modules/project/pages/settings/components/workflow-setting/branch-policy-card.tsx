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
import { EmptyHolder, ErdaIcon, Ellipsis } from 'common';
import { Switch, Input, Select, Popconfirm, Tooltip } from 'antd';
import Line from './line';
import { throttle, compact } from 'lodash';
import { FlowType } from 'project/common/config';
import ResizeObserver from 'rc-resize-observer';

import i18n from 'i18n';
interface BranchPolicyData extends DEVOPS_WORKFLOW.BranchPolicy {
  id: string;
  openTempMerge: boolean;
}

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
  if (branchType === FlowType.MULTI_BRANCH) {
    const valueLen = compact(Object.values(policy)).length;
    return valueLen === 0 || (valueLen === 1 && !!policy.currentBranch);
  } else {
    return !policy.sourceBranch;
  }
};

const BranchPolicyItem = ({
  data: propsData,
  editId,
  onEdit,
  validData,
  cancelEdit,
  onSave,
  onDelete,
  updateMode = false,
  editAuth = false,
  onChange,
}: {
  data: BranchPolicyData;
  editId?: string;
  updateMode?: boolean;
  onEdit?: () => void;
  validData?: (d: BranchPolicyData) => Array<{ label: string; tip: string; key: string }>;
  cancelEdit?: () => void;
  editAuth?: boolean;
  onDelete?: () => void;
  onChange?: (v: BranchPolicyData, saveable: boolean) => void;
  onSave?: (d: BranchPolicyData) => void;
}) => {
  const [data, setData] = React.useState(propsData);
  const [lineWidth, setLineWidth] = React.useState(138);
  const { branch, policy, branchType } = data || {};
  const [showAdd, setShowAdd] = React.useState(false);
  const [validArr, setValidArr] = React.useState<Array<{ label: string; tip: string; key: string }>>([]);

  React.useEffect(() => {
    setData(propsData);
  }, [propsData]);

  const setDataValue = (val: Obj) => {
    setData((prev) => {
      const _curData = { ...prev, ...val };
      const curValidArr = validData ? validData(_curData) : [];
      setValidArr(curValidArr);
      onChange?.(_curData, !!getIsSaveable(curValidArr).saveable);
      return _curData;
    });
  };

  const noPolicy = hasNoPolicy(policy, branchType);
  const isCreate = noPolicy && editId === data.id;

  const onResize = throttle(({ width }: { width: number }) => {
    const curW = (width - 600) / 2;
    setLineWidth(curW < 138 ? 138 : curW);
  }, 500);

  const getIsSaveable = (_validArr?: Array<{ label: string; tip: string; key: string }>) => {
    const showEmpty = !(!noPolicy || showAdd) && !!branch;
    const curValidArr = _validArr || validArr;
    const usedValid = showEmpty ? curValidArr.filter((item) => item.key === 'branch') : [...curValidArr];
    return { saveable: data.branch && !usedValid.length, usedValid };
  };

  const { saveable, usedValid } = getIsSaveable();
  return (
    <ResizeObserver onResize={onResize}>
      <div className="border-all rounded mt-2 mb-4 group">
        <div className="px-4 py-2 flex-h-center border-bottom bg-default-02 justify-between ">
          <div className="flex-h-center">
            <ErdaIcon size={16} className="text-default-4" type="daimafenzhi" />
            {isCreate && noPolicy && !showAdd && !updateMode ? (
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
                      branchType: val.endsWith('*') ? FlowType.MULTI_BRANCH : FlowType.SINGLE_BRANCH,
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
          <If condition={editAuth && !updateMode}>
            {data.id === editId ? (
              <div>
                <span
                  className={`px-2 py-1 rounded  mr-2  ${
                    saveable
                      ? 'cursor-pointer text-purple-deep hover:bg-purple-light'
                      : 'cursor-not-allowed text-default-6'
                  }`}
                  onClick={() => saveable && onSave?.(data)}
                >
                  {i18n.t('Save')}
                </span>
                <span
                  className="cursor-pointer px-2 py-1 rounded text-default-8 hover:bg-default-1"
                  onClick={() => {
                    setShowAdd(false);
                    setValidArr([]);
                    cancelEdit?.();
                  }}
                >
                  {i18n.t('Cancel')}
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

                <Popconfirm
                  title={i18n.t('is it confirmed {action}?', { action: i18n.t('Delete') })}
                  disabled={!!editId}
                  onConfirm={() => !editId && onDelete?.()}
                >
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
                disabledName={updateMode}
                data={data}
                className="flex-shrink-0"
              />
              <If condition={data.branchType === FlowType.MULTI_BRANCH}>
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
                {i18n.t('dop:current branch has no policy')}
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
                    {i18n.t('dop:Click to add a branch policy')}
                  </span>
                </If>
              </div>
            }
          />
        )}
        <If condition={!!usedValid.length}>
          <div className="px-4">
            {usedValid.map((item) => {
              return (
                <div key={item.label} className="mb-1 flex-h-center">
                  <span className="text-default-6 text-left mr-2">{`${item.label}: `}</span>

                  <span className="text-red">{item.tip}</span>
                </div>
              );
            })}
          </div>
        </If>
      </div>
    </ResizeObserver>
  );
};

interface CardProps {
  data: BranchPolicyData;
  className?: string;
  editing: boolean;
  disabledName?: boolean;
  setData: (v: BranchPolicyData) => void;
}
const SourceBranchCard = (props: CardProps) => {
  const { data, className, editing, setData } = props;

  return (
    <div className={`flex-col w-[180px] ${className}`}>
      <div className="text-default-4 mr-2 text-center mb-2 flex-h-center justify-center">
        {i18n.s('source branch', 'dop')}
        <Tooltip
          title={`${i18n.t('dop:Merge change branch')}, ${i18n.t(
            'start with letters and can contain characters that are not wildcard',
          )}`}
        >
          <ErdaIcon type="help" className="ml-1 cursor-pointer" />
        </Tooltip>
      </div>
      {editing ? (
        <Input
          autoFocus
          placeholder={i18n.t('start with letters and can contain characters that are not wildcard')}
          className="bg-default-06 border-none rounded"
          value={data?.policy?.sourceBranch}
          onChange={(e) => setData({ ...data, policy: { ...data.policy, sourceBranch: e.target.value } })}
        />
      ) : (
        <Ellipsis
          className="text-default-8 bg-default-06 rounded px-[11px] py-1 hover:bg-default-1 cursor-pointer h-[30px]"
          title={data?.policy?.sourceBranch || ''}
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
            onChange({ type, value: type === FlowType.MULTI_BRANCH ? `${e.target.value}/*` : e.target.value })
          }
        />
        <span className="px-1 text-base">/</span>
        <Select
          bordered={false}
          className="bg-default-06 w-[75px] h-[30px] rounded"
          value={type}
          onChange={(v) => onChange({ type: v, value: v === FlowType.MULTI_BRANCH ? `${val}/*` : val })}
        >
          <Select.Option value={FlowType.SINGLE_BRANCH}>{i18n.t('none')}</Select.Option>
          <Select.Option value={FlowType.MULTI_BRANCH}>*</Select.Option>
        </Select>
      </div>
    </div>
  );
};

const CurrentBranchCard = (props: CardProps) => {
  const { data, className, editing, setData, disabledName } = props;

  return (
    <div className={`flex-col w-[180px] ${className}`}>
      <div className="text-default-4 mr-2 text-center mb-2">
        <If condition={editing}>
          <span data-required="* " className="ml-1 before:required" />
        </If>
        {i18n.s('current branch', 'dop')}
        <Tooltip
          title={
            <div>
              <div>{i18n.t('dop:A branch for feature development')}</div>
              <div className="mt-1">{`${i18n.s('current branch', 'dop')}: ${i18n.t(
                'start with letters and can contain',
              )}`}</div>
              <div className="mt-1">{`${i18n.s('temporary branch', 'dop')}: ${i18n.t(
                'start with letters and can contain characters that are not wildcard',
              )}`}</div>
            </div>
          }
        >
          <ErdaIcon type="help" className="ml-1 cursor-pointer" />
        </Tooltip>
      </div>
      {editing && !disabledName ? (
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
      ) : (
        <div className="text-default-8 bg-default-06 rounded px-2 py-1 hover:bg-default-1 cursor-pointer">
          {data?.policy?.currentBranch || ' '}
        </div>
      )}
      <If condition={data.branchType === FlowType.MULTI_BRANCH}>
        <div className="flex-col mt-2">
          <div className="flex-h-center">
            <span className="text-default-6 mr-2">{i18n.s('temporary merge', 'dop')}</span>
            <Switch
              checked={data.openTempMerge}
              unCheckedChildren={i18n.t('off')}
              checkedChildren={i18n.t('on')}
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
                title={data?.policy?.tempBranch || ''}
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
        {i18n.t('dop:target branch')}
        <Tooltip
          title={
            <div>
              <div>{i18n.t('dop:Create a change branch based on that branch')}</div>
              <div className="mt-1">{`${i18n.t('dop:target branch')}: ${i18n.t(
                'start with letters and can contain characters that are not wildcard',
              )}`}</div>
              <div className="mt-1">{`pick ${i18n.t('dop:branch')}: ${i18n.t(
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
          title={mergeRequest || ''}
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

export default BranchPolicyItem;
