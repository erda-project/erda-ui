import React from 'react';
import { Select, Divider, Row, Col } from 'antd';
import { map } from 'lodash';
import { EditField, MemberSelector, ErdaIcon } from 'common';
import { Link } from 'react-router-dom';
import { goTo, insertWhen } from 'common/utils';
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
import './meta-fields.scss';

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

const IssueMetaFields = React.forwardRef(
  (
    { labels, isEditMode, isBacklog, editAuth, issueType, formData, setFieldCb, projectId, ticketType }: IProps,
    ref,
  ) => {
    const [widthHolder, width] = useComponentWidth();
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
      getLabels({ type: 'issue', projectID: Number(projectId) });
      issueFieldStore.effects.getSpecialFieldOptions({ orgID, issueType: 'BUG' });
      issueFieldStore.effects.getSpecialFieldOptions({ orgID, issueType: 'TASK' });
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
          className: `mb-4`,
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
          className: 'mb-4',
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
        className: 'mb-4 w-full',
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
          className: 'mb-4 w-full',
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
          className: 'mb-4 w-full',
          name: 'iterationID',
          label: i18n.t('dop:owned iteration'),
          type: 'custom',
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
              placeholder={i18n.t('please choose {name}', { name: i18n.t('dop:owned iteration') })}
            />
          ),
        },
      ]),
      ...insertWhen(issueType === ISSUE_TYPE.TICKET && !isMonitorTicket, [
        {
          icon: 'laiyuan',
          className: 'mb-4',
          name: 'source',
          label: i18n.t('dop:source'),
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
        className: 'mb-4',
        label: i18n.t('dop:priority'),
        type: 'select',
        itemProps: { options: priorityOptions, allowClear: false },
      },
      ...insertWhen(issueType === ISSUE_TYPE.TICKET || issueType === ISSUE_TYPE.BUG, [
        {
          icon: 'yanzhongchengdu',
          className: 'mb-4',
          name: 'severity',
          label: i18n.t('dop:severity'),
          type: 'select',
          itemProps: {
            options: severityOptions,
            allowClear: false,
            placeholder: i18n.t('please choose {name}', { name: i18n.t('dop:severity') }),
          },
        },
      ]),
      ...insertWhen(issueType !== ISSUE_TYPE.TICKET, [
        {
          icon: 'fuzadu',
          className: 'mb-4',
          name: 'complexity',
          label: i18n.t('dop:complexity'),
          type: 'select',
          itemProps: {
            options: complexityOptions,
            allowClear: false,
            placeholder: i18n.t('please choose {name}', { name: i18n.t('dop:complexity') }),
          },
        },
      ]),
      {
        icon: 'jihuashijian',
        className: 'mb-4 w-full',
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
        className: 'mb-4 w-full',
        name: 'planFinishedAt',
        label: i18n.t('deadline'),
        type: 'datePicker',
        showRequiredMark: ISSUE_TYPE.EPIC === issueType,
        itemProps: {
          allowClear: true,
          endDay: true,
        },
      },
      ...insertWhen(![ISSUE_TYPE.TICKET, ISSUE_TYPE.EPIC].includes(issueType), [
        {
          icon: 'yugushijian',
          className: 'mb-4',
          name: ['issueManHour', 'estimateTime'],
          label: i18n.t('dop:EstimateTime'),
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
              triggerChangeOnButton
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
            className: 'mb-4',
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
      {
        icon: 'biaoqian',
        className: 'mb-4 w-full',
        name: 'labels',
        label: i18n.t('label'),
        type: 'select', // 需要新建不存在的tag，用 tagName 作为值传递，不要用 LabelSelect
        itemProps: {
          options: map(optionList, ({ id: labelId, name, isNewLabel }) => {
            if (isNewLabel) {
              return (
                <Option key={labelId} value={name} title={name}>
                  {i18n.t('does not exist')}
                  {name}
                </Option>
              );
            } else {
              return (
                <Option key={labelId} value={name} title={name}>
                  {name}
                </Option>
              );
            }
          }),
          mode: 'tags',
          optionLabelProp: 'title', // 给select组件添加 optionLabelProp 属性，改变回填到选择框的 Option 的属性值
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
        },
      },
      ...insertWhen(issueType === ISSUE_TYPE.TASK, [
        {
          icon: 'renwuleixing',
          className: `mb-4 w-full`,
          name: 'taskType',
          label: i18n.t('task type'),
          type: 'select',
          showRequiredMark: true,
          itemProps: { options: taskTypeOptions, allowClear: false },
        },
      ]),
      ...insertWhen(issueType === ISSUE_TYPE.BUG, [
        {
          icon: 'yinruyuan',
          className: `mb-4 w-full`,
          type: 'select',
          name: 'bugStage',
          label: i18n.t('dop:import source'),
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
      //           {i18n.t('common:custom')}
      //         </Divider>
      //       );
      //     },
      //   },
      // ]),
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
      //             {user.nick || user.name}&nbsp;{i18n.t('created at')}&nbsp;
      //             {moment(formData.createdAt).format('YYYY/MM/DD')}
      //           </div>
      //         </>
      //       );
      //     },
      //   },
      // ]),
    ];

    editFieldList = editFieldList.map((fieldProps) => ({
      onChangeCb: setFieldCb,
      data: formData,
      ...fieldProps,
    }));

    const colSpan = React.useMemo(() => {
      let _span = 1;
      switch (true) {
        case width < 400:
          _span = 24;
          break;
        case width < 720:
          _span = 12;
          break;
        default:
          _span = 8;
      }
      return _span;
    }, [width]);

    return (
      <div className={`issue-meta-fields mt-8`}>
        {widthHolder}
        <Row>
          {editFieldList.map((fieldProps) => {
            return (
              <Col key={fieldProps.label} span={colSpan}>
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
              </Col>
            );
          })}
        </Row>
      </div>
    );
  },
);
export default IssueMetaFields;
