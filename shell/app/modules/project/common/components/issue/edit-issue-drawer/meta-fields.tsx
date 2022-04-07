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
import { Select, Divider, Row, Col, Button } from 'antd';
import { map, difference } from 'lodash';
import { EditField, MemberSelector, ErdaIcon } from 'common';
import { Link } from 'react-router-dom';
import { getIssueRelation, updateIncludeIssue } from 'project/services/issue';
import { goTo, insertWhen, isPromise } from 'common/utils';
import {
  ISSUE_TYPE,
  ISSUE_PRIORITY_LIST,
  ISSUE_COMPLEXITY_MAP,
  BUG_SEVERITY_MAP,
} from 'project/common/components/issue/issue-config';
import i18n from 'i18n';
import issueStore from 'project/stores/issues';
import routeInfoStore from 'core/stores/route';
import iterationStore from 'app/modules/project/stores/iteration';
import IssueState from 'project/common/components/issue/issue-state';
import { useMount } from 'react-use';
import IterationSelect from '../iteration-select';
import { TimeInput } from '../time-input';
import { TextFieldInput, NumberFieldInput } from '../text-field-input';
import { TimeTrace } from '../time-trace';
import { FIELD_TYPE_ICON_MAP } from 'org/common/config';
import issueFieldStore from 'org/stores/issue-field';
import orgStore from 'app/org-home/stores/org';
import labelStore from 'project/stores/label';
import { useComponentWidth } from 'common/use-hooks';
import moment from 'moment';
import './meta-fields.scss';
import { TagItem } from 'app/common/components/tags';

const { Option } = Select;

const getCustomOptions = (enumeratedValues: ISSUE_FIELD.IEnumData[]) => {
  return map(enumeratedValues, ({ name, id }) => (
    <Option key={name} value={id || name}>
      {name}
    </Option>
  ));
};

const priorityOptions = map(ISSUE_PRIORITY_LIST, ({ iconLabel, value }) => (
  <Option key={value} value={value}>
    {iconLabel}
  </Option>
));
const complexityOptions = map(ISSUE_COMPLEXITY_MAP, ({ iconLabel, value }) => (
  <Option key={value} value={value}>
    {iconLabel}
  </Option>
));
const severityOptions = map(BUG_SEVERITY_MAP, ({ iconLabel, value }) => (
  <Option key={value} value={value}>
    {iconLabel}
  </Option>
));

const compareTime = (t1?: string, t2?: string) => {
  if (!t1 || !t2) return false; // change to backlog, need confirm;
  return moment(t1).isBefore(t2);
};

interface IProps {
  labels: LABEL.Item[];
  isEditMode: boolean;
  isBacklog: boolean;
  editAuth: boolean;
  issueType: ISSUE_TYPE;
  formData: Obj;
  setFieldCb: (value: Obj, fieldType?: string | undefined) => void;
  projectId?: string;
  ticketType?: string;
}

interface GetCompProps {
  value?: string | number;
  disabled?: boolean;
  originalValue?: string;
  onSave: (v: string | number) => void;
}

interface IterationExtraProps {
  force: boolean;
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const IterationFiedExtra = (props: IterationExtraProps) => {
  const { force, visible, onCancel, onOk } = props;
  const data = getIssueRelation.useData();
  if (!data?.include?.length) {
    return null;
  }
  const [title, btn] = force
    ? [
        i18n.t('dop:issue-iteration-update-tip'),
        <Button size="small" type="primary" onClick={onCancel}>
          {i18n.t('dop:i know')}
        </Button>,
      ]
    : [
        i18n.t('dop:issue-iteration-update-tip-2'),
        <div className="flex-h-center">
          <Button type="primary" ghost size="small" onClick={onCancel}>
            {i18n.t('cancel')}
          </Button>
          <Button size="small" className="ml-2" type="primary" onClick={onOk}>
            {i18n.t('dop:synchronize')}
          </Button>
        </div>,
      ];
  return visible ? (
    <div className="bg-default-04 rounded border border-solid border-default-1 p-3 flex-h-center justify-between relative issue-extra-field">
      <div className="font-bold mr-3">{title}</div>
      {btn}
    </div>
  ) : null;
};

interface LabelExtraProps {
  optionList: LABEL.Item[];
  labelUpdate: { prev: string[]; current: string[] };
  onCancel: () => void;
  onOk: () => void;
}
const LabelFiedExtra = (props: LabelExtraProps) => {
  const { labelUpdate, optionList, onCancel, onOk } = props;
  const { prev, current } = labelUpdate;
  const [expand, setExpand] = React.useState(true);
  const data = getIssueRelation.useData();
  if (!data?.include?.length) {
    return null;
  }
  if (prev.join(',') === current.join(',')) {
    return null;
  } else {
    const del = difference(prev, current);
    const add = difference(current, prev);
    return (
      <div className="bg-default-04 rounded border border-solid border-default-1 p-3 issue-labels-extra max-w-[600px] issue-extra-field relative">
        <div className="flex-h-center justify-between">
          <div className="font-bold mr-3 flex-h-center">
            <ErdaIcon
              type="caret-down"
              className={`mr-1 cursor-pointer expand-icon ${expand ? '' : 'un-expand'}`}
              size={'18'}
              onClick={() => setExpand((_expand) => !_expand)}
            />
            {i18n.t('dop:issue-labels-update-tip')}
          </div>
          <div className="flex-h-center">
            <Button type="primary" ghost size="small" onClick={onCancel}>
              {i18n.t('cancel')}
            </Button>
            <Button size="small" className="ml-2" type="primary" onClick={onOk}>
              {i18n.t('dop:synchronize')}
            </Button>
          </div>
        </div>
        {expand ? (
          <div className="mx-6 issue-label-diff">
            {add.length ? (
              <div className="flex py-2">
                <span className="mr-2 text-success">{`${i18n.t('dop:add')}: `}</span>
                <div className="flex-1">
                  {add.map((item) => {
                    const curLabel = optionList.find((opt) => opt.name === item);
                    return curLabel ? (
                      <TagItem
                        style={{ marginBottom: 2 }}
                        key={item}
                        label={{ label: item, color: curLabel.color }}
                        readOnly
                      />
                    ) : null;
                  })}
                </div>
              </div>
            ) : null}
            {del.length ? (
              <div className="flex  py-2">
                <span className="mr-2 text-danger">{`${i18n.t('delete')}: `}</span>
                <div className="flex-1">
                  {del.map((item) => {
                    const curLabel = optionList.find((opt) => opt.name === item);
                    return curLabel ? (
                      <TagItem
                        style={{ marginBottom: 2 }}
                        key={item}
                        label={{ label: item, color: curLabel.color }}
                        readOnly
                      />
                    ) : null;
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
};

const IssueMetaFields = React.forwardRef(
  (
    { labels, isEditMode, isBacklog, editAuth, issueType, formData, setFieldCb, projectId, ticketType }: IProps,
    ref,
  ) => {
    const [widthHolder, width] = useComponentWidth();
    const [labelUpdate, setLabelUpdate] = React.useState<null | { prev: string[]; current: string[] }>(
      formData?.labels
        ? {
            current: formData?.labels || [],
            prev: formData?.labels || [],
          }
        : null,
    );
    const [iterationUpdate, setIterationUpdate] = React.useState<{
      name: string;
      id: string;
      visible: boolean;
      force: boolean;
    }>({ name: '', visible: false, force: false, id: '' });

    React.useEffect(() => {
      !labelUpdate &&
        formData.labels &&
        setLabelUpdate({ current: formData?.labels || [], prev: formData?.labels || [] });
    }, [formData?.labels, setLabelUpdate, labelUpdate]);

    const { getLabels } = labelStore.effects;
    const { id: orgID } = orgStore.useStore((s) => s.currentOrg);
    const urlParams = routeInfoStore.useStore((s) => s.params);
    const isEpic = issueType === ISSUE_TYPE.EPIC;
    const iterationList = iterationStore.useStore((s) => s.iterationList);
    const isMonitorTicket = ticketType === 'monitor';
    const customFieldDetail = issueStore.getState((s) => s.customFieldDetail);

    const [bugStageList, taskTypeList] = issueFieldStore.useStore((s) => [s.bugStageList, s.taskTypeList]);
    const [optionList, setOptionList] = React.useState(labels);
    const stageOptions = React.useMemo(() => {
      return map(bugStageList, ({ name, id, value }) => (
        <Option key={id} value={value}>
          {name}
        </Option>
      ));
    }, [bugStageList]);
    const taskTypeOptions = React.useMemo(() => {
      return map(taskTypeList, ({ name, id, value }) => (
        <Option key={id} value={value}>
          {name}
        </Option>
      ));
    }, [taskTypeList]);

    React.useEffect(() => {
      if (ref && !ref.current) {
        const customFieldKeys = map(customFieldDetail?.property, 'propertyName').concat([
          'taskType',
          'bugStage',
          'owner',
        ]);
        ref.current = {
          onFocus: (fKey: string) => {
            const curRef = ref.current?.refMap[fKey];
            if (fKey === 'issueManHour.elapsedTime') {
              // click to open time trace
              curRef.click();
            } else if (customFieldKeys.includes(fKey)) {
              curRef?.focus?.();
            } else {
              curRef?.focus?.();
            }
          },
          refMap: {},
        };
      }
    }, [ref, customFieldDetail]);

    useMount(() => {
      if (issueType === 'BUG' || issueType === 'TASK') {
        issueFieldStore.effects.getSpecialFieldOptions({ orgID, issueType });
      }
      if (!iterationList.length && !isBacklog) {
        iterationStore.effects.getIterations({
          pageNo: 1,
          pageSize: 100,
          projectID: +urlParams.projectId,
          withoutIssueSummary: true,
        });
      }
    });

    React.useEffect(() => {
      setOptionList(labels);
    }, [labels, formData.labels]); // reset list after change

    const customFieldList = React.useMemo(() => {
      return map(customFieldDetail?.property, (filedData: ISSUE_FIELD.IFiledItem) => {
        const { propertyName, displayName = '', required, propertyType, enumeratedValues } = filedData;

        return {
          className: `mb-3`,
          name: propertyName,
          label: displayName,
          required,
          icon: 'zidingyi-form',
          type: FIELD_TYPE_ICON_MAP[propertyType]?.component,
          showRequiredMark: required,
          itemProps: {
            className: 'w-full',
            options: getCustomOptions(enumeratedValues || []),
            mode: propertyType === 'MultiSelect' ? 'multiple' : undefined,
            allowClear: !required,
          },
          getComp: ({ value, disabled, originalValue, onSave }: GetCompProps) => {
            return propertyType === 'Person' ? (
              <MemberSelector
                scopeType="project"
                ref={(r) => {
                  const _refMap = ref?.current?.refMap;
                  _refMap && (_refMap[propertyName] = r);
                }}
                className="issue-field-member issue-field-owner"
                disabled={!editAuth}
                scopeId={urlParams.projectId || String(projectId)}
                onChange={(val) => onSave(val as string)}
                value={value}
                allowClear={!required}
                selectSelfInOption
              />
            ) : propertyType === 'Number' ? (
              <NumberFieldInput
                className="w-full"
                value={value}
                ref={(r) => {
                  const _refMap = ref?.current?.refMap;
                  _refMap && (_refMap[propertyName] = r);
                }}
                onChange={(e: string) => {
                  onSave(e);
                }}
              />
            ) : (
              <TextFieldInput
                showErrTip
                ref={(r) => {
                  const _refMap = ref?.current?.refMap;
                  _refMap && (_refMap[propertyName] = r);
                }}
                value={value}
                displayName={displayName}
                rule={(FIELD_TYPE_ICON_MAP[propertyType] as Obj)?.rule}
                passAndTrigger
                triggerChangeOnButton
                originalValue={originalValue}
                onChange={onSave}
                disabled={disabled}
              />
            );
          },
        };
      });
    }, [customFieldDetail?.property, editAuth, urlParams.projectId, projectId, ref]);

    let editFieldList = [
      ...insertWhen(isEditMode, [
        {
          icon: 'zhuangtai',
          className: 'mb-3',
          name: 'state',
          label: i18n.t('dop:state'),
          type: 'select',
          itemProps: {
            options: map(formData.issueButton, ({ stateID, permission: curAuth }) => (
              <Option disabled={!curAuth} key={stateID} value={stateID}>
                <IssueState stateID={stateID} />
              </Option>
            )),
            allowClear: false,
          },
        },
      ]),
      {
        icon: 'chuliren',
        className: 'mb-3 w-full',
        name: 'assignee',
        label: i18n.t('dop:assignee'),
        type: 'custom',
        showRequiredMark: true,
        getComp: ({ value, onSave }: Pick<GetCompProps, 'value' | 'onSave'>) => {
          return (
            <MemberSelector
              scopeType="project"
              className="issue-field-member flex-initialissue-field-assignee"
              disabled={!editAuth}
              scopeId={urlParams.projectId || String(projectId)}
              onChange={(val) => onSave(val as string)}
              value={value}
              allowClear={false}
              selectSelfInOption
            />
          );
        },
      },
      ...insertWhen(issueType === ISSUE_TYPE.BUG && isEditMode, [
        {
          icon: 'zerenren',
          className: 'mb-3 w-full',
          type: 'custom',
          name: 'owner',
          label: i18n.t('dop:responsible person'),
          getComp: ({ value, onSave }: Pick<GetCompProps, 'value' | 'onSave'>) => {
            return (
              <MemberSelector
                scopeType="project"
                className="issue-field-member issue-field-owner"
                ref={(r) => {
                  const _refMap = ref?.current?.refMap;
                  _refMap && (_refMap.owner = r);
                }}
                disabled={!editAuth}
                scopeId={urlParams.projectId || String(projectId)}
                onChange={(val) => onSave(val as string)}
                value={value}
                allowClear={false}
                selectSelfInOption
              />
            );
          },
        },
      ]),
      ...insertWhen(issueType !== ISSUE_TYPE.TICKET && issueType !== ISSUE_TYPE.EPIC, [
        {
          icon: 'diedai',
          className: 'mb-3 w-full',
          name: 'iterationID',
          label: i18n.t('dop:Iteration'),
          type: 'custom',
          onChangeCb: (v: { iterationID: string }) => {
            const curIteration = iterationList.find((item) => `${item.id}` === `${v.iterationID}`);
            const preIteration = iterationList.find((item) => `${item.id}` === `${formData?.iterationID}`);
            const withChildrenIteration = compareTime(curIteration?.finishedAt, preIteration?.finishedAt);
            setIterationUpdate({
              id: `${v.iterationID}`,
              name: `${v.iterationID}` === '-1' ? i18n.t('dop:backlog') : curIteration?.title || '',
              force: withChildrenIteration,
              visible: true,
            });

            const res = setFieldCb({ ...v });
            if (isPromise(res)) {
              res.then(() => {
                if (withChildrenIteration) {
                  updateIncludeIssue({
                    issueId: formData.id,
                    updateFields: [
                      {
                        updateType: 'REPLACE',
                        field: 'iterationID',
                        value: { content: +v.iterationID },
                      },
                    ],
                  }).then(() => {
                    getIssueRelation.fetch({ issueId: formData.id });
                  });
                }
              });
            }
          },
          valueRender: (value: string) => {
            const match = iterationList.find((item) => String(item.id) === String(value));
            return match ? match.title : value;
          },
          getComp: ({ value, onSave }: Pick<GetCompProps, 'value' | 'onSave'>) => (
            <IterationSelect
              fullWidth
              className={'hover:bg-default-06'}
              suffixIcon={<ErdaIcon type="caret-down" className="text-default-3" />}
              bordered={false}
              value={value as number}
              onChange={onSave}
              disabled={!editAuth}
              placeholder={i18n.t('please choose {name}', { name: i18n.t('dop:Iteration') })}
            />
          ),
          extraContent: (
            <IterationFiedExtra
              onCancel={() => {
                setIterationUpdate((prev) => ({ ...prev, visible: false }));
              }}
              onOk={() => {
                updateIncludeIssue({
                  issueId: formData.id,
                  updateFields: [
                    {
                      updateType: 'REPLACE',
                      field: 'iterationID',
                      value: { content: +iterationUpdate.id },
                    },
                  ],
                }).then(() => {
                  getIssueRelation.fetch({ issueId: formData.id });
                });
                setIterationUpdate((prev) => ({ ...prev, visible: false }));
              }}
              {...iterationUpdate}
            />
          ),
        },
      ]),
      {
        icon: 'jihuashijian',
        className: 'mb-3 w-full',
        name: 'planStartedAt',
        label: i18n.t('common:start at'),
        type: 'datePicker',
        showRequiredMark: ISSUE_TYPE.EPIC === issueType,
        itemProps: {
          allowClear: true,
        },
      },
      {
        icon: 'jihuashijian',
        className: 'mb-3 w-full',
        name: 'planFinishedAt',
        label: i18n.t('End date'),
        type: 'datePicker',
        showRequiredMark: ISSUE_TYPE.EPIC === issueType,
        itemProps: {
          allowClear: true,
          endDay: true,
        },
      },
      ...insertWhen(issueType === ISSUE_TYPE.TICKET && !isMonitorTicket, [
        {
          icon: 'laiyuan',
          className: 'mb-3',
          name: 'source',
          label: i18n.t('dop:Source'),
          itemProps: {
            placeholder: i18n.t('please enter'),
            maxLength: 200,
          },
        },
      ]),
      // {
      //   name: 'splitLine1',
      //   type: 'custom',
      //   getComp: () => <Divider className="mb-6 mt-0" />,
      // },
      {
        icon: 'youxianji',
        name: 'priority',
        className: 'mb-3',
        label: i18n.t('dop:Priority'),
        type: 'select',
        itemProps: { options: priorityOptions, allowClear: false },
      },
      ...insertWhen(issueType === ISSUE_TYPE.TICKET || issueType === ISSUE_TYPE.BUG, [
        {
          icon: 'yanzhongchengdu',
          className: 'mb-3',
          name: 'severity',
          label: i18n.t('dop:Severity'),
          type: 'select',
          itemProps: {
            options: severityOptions,
            allowClear: false,
            placeholder: i18n.t('please choose {name}', { name: i18n.t('dop:Severity') }),
          },
        },
      ]),
      ...insertWhen(issueType !== ISSUE_TYPE.TICKET, [
        {
          icon: 'fuzadu',
          className: 'mb-3',
          name: 'complexity',
          label: i18n.t('dop:Complexity'),
          type: 'select',
          itemProps: {
            options: complexityOptions,
            allowClear: false,
            placeholder: i18n.t('please choose {name}', { name: i18n.t('dop:Complexity') }),
          },
        },
      ]),
      ...insertWhen(![ISSUE_TYPE.TICKET, ISSUE_TYPE.EPIC].includes(issueType), [
        {
          icon: 'yugushijian',
          className: 'mb-3',
          name: ['issueManHour', 'estimateTime'],
          label: i18n.t('dop:Estimated time'),
          type: 'custom',
          getComp: ({ value, disabled, originalValue }: Pick<GetCompProps, 'value' | 'originalValue' | 'disabled'>) => (
            <TimeInput
              showErrTip
              value={value}
              passAndTrigger
              ref={(r) => {
                const _refMap = ref?.current?.refMap;
                _refMap && (_refMap['issueManHour.estimateTime'] = r);
              }}
              originalValue={originalValue}
              onChange={(v: number) => {
                if (isEditMode && formData?.issueManHour?.isModifiedRemainingTime !== false) {
                  setFieldCb({ issueManHour: { estimateTime: v || 0 } });
                } else {
                  // 创建模式或编辑模式但剩余时间为空时，设置剩余时间为预估时间
                  setFieldCb({ issueManHour: { estimateTime: v || 0, remainingTime: v || 0 } });
                }
              }}
              disabled={disabled}
            />
          ),
        },
        ...insertWhen(!isEpic && isEditMode, [
          {
            icon: 'lishijilu',
            className: 'mb-3',
            name: 'issueManHour',
            label: i18n.t('dop:Time tracking'),
            type: 'custom',
            getComp: ({ value, disabled }: Pick<GetCompProps, 'value' | 'disabled'>) => (
              <TimeTrace
                value={value}
                ref={(r) => {
                  const _refMap = ref?.current?.refMap;
                  _refMap && (_refMap['issueManHour.elapsedTime'] = r);
                }}
                onChange={(v) => setFieldCb({ issueManHour: v })}
                isModifiedRemainingTime={formData?.issueManHour?.isModifiedRemainingTime}
                disabled={disabled}
              />
            ),
          },
        ]),
      ]),
      ...insertWhen(issueType === ISSUE_TYPE.TASK, [
        {
          icon: 'renwuleixing',
          className: `mb-3 w-full`,
          name: 'taskType',
          label: i18n.t('Task type'),
          type: 'select',
          showRequiredMark: true,
          itemProps: { options: taskTypeOptions, allowClear: false },
        },
      ]),
      ...insertWhen(issueType === ISSUE_TYPE.BUG, [
        {
          icon: 'yinruyuan',
          className: `mb-3 w-full`,
          type: 'select',
          name: 'bugStage',
          label: i18n.t('dop:Import source'),
          showRequiredMark: true,
          itemProps: { options: stageOptions, allowClear: false },
        },
      ]),
      // ...insertWhen(!!customFieldList.length, [
      //   {
      //     type: 'readonly',
      //     name: '',
      //     label: '',
      //     valueRender: () => {
      //       return (
      //         <Divider className="mb-6 mt-0.5 text-xs text-desc" plain>
      //           {i18n.t('common:Custom')}
      //         </Divider>
      //       );
      //     },
      //   },
      // ]),
      {
        icon: 'biaoqian',
        className: 'mb-3',
        name: 'labels',
        label: i18n.t('label'),
        fullWidth: true,
        type: 'select', // 需要新建不存在的tag，用 tagName 作为值传递，不要用 LabelSelect
        itemProps: {
          options: map(optionList, ({ id: labelId, name, isNewLabel, color }) => {
            if (isNewLabel) {
              return (
                <Option key={labelId} value={name} data-title={name}>
                  {i18n.t('does not exist')}
                  {name}
                </Option>
              );
            } else {
              const opItem = <TagItem label={{ label: name, color }} readOnly />;
              return (
                <Option key={labelId} value={name} color={color}>
                  {opItem}
                </Option>
              );
            }
          }),
          mode: 'tags',
          tagRender: (props: { label: JSX.Element; onClose: () => void }) => {
            const { label, onClose } = props;
            return (
              <span
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {typeof label === 'string'
                  ? null
                  : React.cloneElement(label, {
                      onDelete: () => onClose(),
                      deleteConfirm: false,
                      style: { marginLeft: 0, marginRight: 8 },
                    })}
              </span>
            );
          },
          dropdownRender: (menu: React.ReactNode) => (
            <div>
              {menu}
              <Divider className="my-1" />
              <Link
                to={goTo.resolve.projectLabel()}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(goTo.resolve.projectLabel(), { jumpOut: true });
                }}
              >
                <div className="mx-3">{i18n.t('dop:edit label')}</div>
              </Link>
            </div>
          ),
          onSearch: (value: string) => {
            if (!value) {
              setOptionList(labels);
              return;
            }
            const match = labels.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()));
            if (!match.length) {
              setOptionList([]);
              return;
            }
            setOptionList(match);
          },
          onDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
              getLabels({ type: 'issue', projectID: Number(projectId) });
            }
          },
        },
        onChangeCb: (v: { labels: string[] }) => {
          setFieldCb(v);
          setLabelUpdate((d) => ({ prev: d?.prev || [], current: v.labels }));
        },
        extraContent: (
          <LabelFiedExtra
            optionList={optionList}
            labelUpdate={labelUpdate || { prev: [], current: [] }}
            onCancel={() => {
              const curLabel = formData.labels;
              setLabelUpdate({ prev: curLabel, current: curLabel });
            }}
            onOk={() => {
              const curLabel = formData.labels;
              const del = difference(labelUpdate?.prev, labelUpdate?.current || []);
              const add = difference(labelUpdate?.current, labelUpdate?.prev || []);
              updateIncludeIssue({
                issueId: formData.id,
                updateFields: [
                  {
                    updateType: 'MERGE',
                    field: 'labels',
                    value: {
                      addition: add.map((item) => optionList.find((opItem) => opItem.name === item)?.id || item),
                      deletion: del.map((item) => optionList.find((opItem) => opItem.name === item)?.id || item),
                    },
                  },
                ],
              });
              setLabelUpdate({ prev: curLabel, current: curLabel });
            }}
          />
        ),
      },
      ...customFieldList,
      // ...insertWhen(isEditMode, [
      //   {
      //     name: 'creator',
      //     label: '',
      //     type: 'readonly',
      //     valueRender: (value: string) => {
      //       let user = projectMembers.find((item: IMember) => String(item.userId) === String(value)) as IMember;
      //       if (!user) {
      //         user = userMap[value] || {};
      //       }

      //       return (
      //         <>
      //           <Divider className="mb-6 mt-0.5" />
      //           <div className="text-desc text-xs prewrap">
      //             {user.nick || user.name}&nbsp;{i18n.t('Creation time')}&nbsp;
      //             {moment(formData.createdAt).format('YYYY/MM/DD')}
      //           </div>
      //         </>
      //       );
      //     },
      //   },
      // ]),
      // keep labels as last field for full width
    ];

    editFieldList = editFieldList.map((fieldProps) => ({
      onChangeCb: setFieldCb,
      data: formData,
      ...fieldProps,
    }));

    return (
      <div className={`issue-meta-fields mt-4`}>
        {widthHolder}
        <Row gutter={16}>
          {editFieldList.map((fieldProps) => {
            const fieldContent = (
              <EditField
                ref={(r) => {
                  const _refMap = ref?.current?.refMap;
                  _refMap && (_refMap[fieldProps.name] = r);
                }}
                refMap={ref?.current?.refMap}
                key={typeof fieldProps.name === 'string' ? fieldProps.name : fieldProps.name.join(',')}
                {...fieldProps}
                disabled={!editAuth}
              />
            );
            return (
              <Col key={fieldProps.label} span={24}>
                {fieldProps.fullWidth ? fieldContent : <div className="w-1/2">{fieldContent}</div>}
              </Col>
            );
          })}
        </Row>
      </div>
    );
  },
);
export default IssueMetaFields;
