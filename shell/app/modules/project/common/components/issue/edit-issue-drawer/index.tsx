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
import { Button, message, Spin, Dropdown, Menu, Popconfirm } from 'antd';
import { IssueIcon, getIssueTypeOption } from 'project/common/components/issue/issue-icon';
import { map, has, cloneDeep, includes, isEmpty, merge, find } from 'lodash';
import { EditField, ErdaIcon, Icon as CustomIcon, IF } from 'common';
import {
  ISSUE_TYPE,
  ISSUE_TYPE_MAP,
  ISSUE_PRIORITY_MAP,
  ISSUE_COMPLEXITY_MAP,
  EDIT_PROPS,
  BUG_SEVERITY_MAP,
} from 'project/common/components/issue/issue-config';
import i18n from 'i18n';
import issueStore from 'project/stores/issues';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import { IssueDrawer } from 'project/common/components/issue/issue-drawer';
import { IssueCommentBox } from 'project/common/components/issue/comment-box';
import { AddMrRelation } from 'project/common/components/issue/add-mr-relation';
import { IssueActivities } from 'project/common/components/issue/issue-activities';
import { updateSearch } from 'common/utils/query-string';
import iterationStore from 'app/modules/project/stores/iteration';
import labelStore from 'project/stores/label';
import userStore from 'app/user/stores';
import { usePerm, WithAuth, getAuth, isAssignee, isCreator } from 'user/common';
import { IssueTestCaseRelation } from '../issue-testCase-relation';
import { FIELD_WITH_OPTION } from 'org/common/config';
import { produce } from 'immer';
import issueFieldStore from 'org/stores/issue-field';
import orgStore from 'app/org-home/stores/org';
import { templateMap } from 'project/common/issue-config';
import IssueMetaFields from './meta-fields';
import { FullIssueRelation } from '../issue-relation';
import { getIssueRelation } from 'project/services/issue';

export const ColorIcon = ({ icon }: { icon: string }) => {
  return (
    <CustomIcon type={icon} className="mr-2" color style={{ height: '20px', width: '20px', verticalAlign: 'sub' }} />
  );
};

export interface CloseDrawerParam {
  hasEdited: boolean;
  isCreate: boolean;
  isDelete: boolean;
}
interface IProps {
  issueType: ISSUE_TYPE;
  id?: number;
  iterationID?: number;
  visible: boolean;
  projectId?: string;
  ticketType?: 'monitor'; // 区分监控工单
  shareLink?: string;
  subDrawer?: JSX.Element | null;
  customUrl?: string; // 监控特殊 url 用来增改工单
  closeDrawer: (params: CloseDrawerParam) => void;
}

export const EditIssueDrawer = (props: IProps) => {
  const {
    id: propId,
    visible,
    closeDrawer,
    issueType: propsIssueType,
    iterationID,
    projectId,
    shareLink,
    subDrawer,
    ticketType,
    customUrl,
  } = props;
  const [issueType, setIssueType] = React.useState(propsIssueType);
  const type = issueType.toLowerCase();
  const {
    getIssueDetail,
    updateIssue,
    updateType,
    getIssueStreams,
    createIssue,
    copyIssue,
    addIssueStream,
    deleteIssue,
    getFieldsByIssue,
    addFieldsToIssue,
  } = issueStore.effects;
  const { clearIssueDetail } = issueStore.reducers;
  const [bugStageList, taskTypeList, fieldList] = issueFieldStore.useStore((s) => [
    s.bugStageList,
    s.taskTypeList,
    s.fieldList,
  ]);
  const id = propId;
  const isEditMode = !!id;
  const defaultCustomFormData = React.useMemo(() => {
    const customFieldDefaultValues = {};
    map(fieldList, (item) => {
      if (item && item.required) {
        if (item.propertyType === 'Select') {
          customFieldDefaultValues[item.propertyName] = item.enumeratedValues?.[0].id;
        }
        if (item.propertyType === 'MultiSelect') {
          customFieldDefaultValues[item.propertyName] = [item.enumeratedValues?.[0].id];
        }
      }
    });
    return customFieldDefaultValues;
  }, [fieldList]);

  const defaultFormData = React.useMemo(() => {
    return {
      priority: ISSUE_PRIORITY_MAP.NORMAL.value,
      complexity: ISSUE_COMPLEXITY_MAP.NORMAL.value,
      severity: BUG_SEVERITY_MAP.NORMAL.value,
      taskType: taskTypeList?.length ? taskTypeList[0].value : '',
      bugStage: bugStageList?.length ? bugStageList[0].value : '',
      assignee: userStore.getState((s) => s.loginUser.id),
      planFinishedAt: issueType === ISSUE_TYPE.EPIC ? new Date() : undefined,
      planStartedAt: issueType === ISSUE_TYPE.EPIC ? new Date() : undefined,
      iterationID,
      content: isEditMode ? '' : templateMap[issueType] || '',
      ...defaultCustomFormData,
    };
  }, [bugStageList, defaultCustomFormData, isEditMode, issueType, iterationID, taskTypeList]);
  const [formData, setFormData] = React.useState(defaultFormData as any);
  const issueDetail: ISSUE.IssueType = issueStore.useStore((s) => s[`${type}Detail`]);

  // 监听bugDetail、taskDetail、requirementDetail的变化，切换类型后触发刷新
  issueStore.useStore((s) => [s.bugDetail, s.taskDetail, s.requirementDetail]);

  const labels = labelStore.useStore((s) => s.list);
  const [updateIssueLoading] = useLoading(issueStore, ['updateIssue']);
  const labelNames = map(labels, ({ name }) => name);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasEdited, setHasEdited] = React.useState(false);
  const [tempDescContent, setTempDescContent] = React.useState('');
  const [disableSubmit, setDisableSubmit] = React.useState(false);
  const isBug = issueType === ISSUE_TYPE.BUG;
  const customFieldDetail = issueStore.useStore((s) => s.customFieldDetail);
  const [customFormData, setCustomFormData] = React.useState(customFieldDetail as any);
  const { getFieldsByIssue: getCustomFieldsByProject } = issueFieldStore.effects;

  const savingRef = React.useRef(false);
  const isBacklog = iterationID === -1;
  const isMonitorTicket = ticketType === 'monitor';

  const { creator, assignee, testPlanCaseRels } = issueDetail || {};
  const specialProps = EDIT_PROPS[issueType];
  const projectPerm = usePerm((s) => s.project);
  const permObjMap = {
    [ISSUE_TYPE.REQUIREMENT]: projectPerm.requirement,
    [ISSUE_TYPE.TASK]: projectPerm.task,
    [ISSUE_TYPE.BUG]: projectPerm.bug,
    [ISSUE_TYPE.TICKET]: projectPerm.ticket,
    [ISSUE_TYPE.EPIC]: projectPerm.epic,
  };
  const permObj = permObjMap[issueType];
  const checkRole = [isCreator(creator), isAssignee(assignee)];
  const deleteAuth = isMonitorTicket ? true : getAuth(permObj.delete, checkRole);
  const createAuth = permObj.create.pass;
  const editAuth = isMonitorTicket ? true : !isEditMode || getAuth(permObj.edit, checkRole);
  const switchTypeAuth = getAuth(permObj.switchType, checkRole);

  const addRelatedMattersProjectId = routeInfoStore.getState((s) => s.params).projectId;
  const { addIssueRelation } = issueStore.effects;
  const { updateCustomFieldDetail } = issueStore.reducers;
  const { id: orgID } = orgStore.useStore((s) => s.currentOrg);
  const metaFieldsRef: React.RefObject<unknown> = React.useRef(null);
  const [tempStateData, setTempStateData] = React.useState('');

  React.useEffect(() => {
    setFormData((prev: any) => ({ ...prev, iterationID }));
  }, [iterationID]);

  const getCustomFields = React.useCallback(() => {
    id && getFieldsByIssue({ issueID: id, propertyIssueType: issueType, orgID });
  }, [getFieldsByIssue, id, issueType, orgID]);

  React.useEffect(() => {
    setIssueType(propsIssueType);
  }, [propsIssueType]);

  React.useEffect(() => {
    if (visible) {
      if (id) {
        getIssueDetail({ type: issueType, id });
        getIssueStreams({ type: issueType, id, pageNo: 1, pageSize: 100 });
        getCustomFields();
      }
      getCustomFieldsByProject({
        propertyIssueType: issueType,
        orgID,
      }).then((res) => {
        updateCustomFieldDetail({
          property: res,
          orgID,
          projectID: +addRelatedMattersProjectId,
          issueID: undefined,
        });
      });
    }
  }, [
    addRelatedMattersProjectId,
    getCustomFields,
    getCustomFieldsByProject,
    getFieldsByIssue,
    getIssueDetail,
    getIssueStreams,
    id,
    issueType,
    orgID,
    updateCustomFieldDetail,
    visible,
  ]);

  const customFieldValues = React.useMemo(() => {
    customFieldDetail && setCustomFormData(customFieldDetail);
    const tempFormData = {};
    map(customFieldDetail?.property, (item) => {
      const { arbitraryValue, propertyType, values, propertyName } = item;
      const _values = values || [];
      tempFormData[propertyName] = FIELD_WITH_OPTION[propertyType]
        ? propertyType === 'MultiSelect'
          ? _values
          : _values[0]
        : arbitraryValue;
    });
    return tempFormData;
  }, [customFieldDetail]);

  React.useEffect(() => {
    issueDetail && setFormData({ ...issueDetail, ...customFieldValues });
  }, [customFieldValues, issueDetail]);

  const dataCheck = (_data: Obj) => {
    if (ISSUE_TYPE.TASK === issueType) {
      // 创建时任务必填预估工时, 任务类型
      if (!isEditMode && !_data.taskType && issueType === ISSUE_TYPE.TASK) {
        message.warn(i18n.t('task type'));
        return false;
      }
      // if (!isEditMode && !_data.issueManHour?.estimateTime) {
      //   message.warn(i18n.t('dop:missing estimateTime'));
      //   return false;
      // }
    }
    if (!_data.title) {
      message.warn(i18n.t('dop:missing title'));
      return false;
    }
    if (!_data.assignee) {
      message.warn(i18n.t('dop:missing assignee'));
      return false;
    }

    // if (!_data.iterationID) {
    //   message.warn(i18n.t('please choose {name}', { name: i18n.t('dop:owned iteration') }));
    //   return false;
    // }

    if (ISSUE_TYPE.BUG === issueType) {
      if (!_data.bugStage) {
        message.warn(i18n.t('dop:missing import source'));
        return false;
      }
    }
    if (!_data.planFinishedAt && ISSUE_TYPE.EPIC === issueType) {
      message.warn(i18n.t('dop:missing deadline'));
      return false;
    }

    if (!_data.planStartedAt && ISSUE_TYPE.EPIC === issueType) {
      message.warn(i18n.t('dop:missing startTime'));
      return false;
    }

    return true;
  };

  const checkFieldNotEmpty = (propertyType: ISSUE_FIELD.IPropertyType, propertyValue: any) => {
    if (propertyType === 'MultiSelect') {
      return !isEmpty(propertyValue);
    } else if (propertyType === 'Number') {
      return propertyValue || String(propertyValue) === '0';
    } else {
      return propertyValue;
    }
  };

  const checkCustomFormData = (filterKey?: string) => {
    if (customFormData?.property) {
      const tempList = customFormData.property;
      for (let i = 0, len = tempList.length; i < len; i++) {
        const { displayName, required, arbitraryValue, propertyType, values, propertyName } = tempList[i];
        const _values = values || [];

        let propertyValue = [];
        if (propertyType === 'MultiSelect') {
          propertyValue = _values;
        } else if (propertyType === 'Select') {
          propertyValue = _values.length ? [_values[0]] : [];
        } else {
          propertyValue = arbitraryValue || String(arbitraryValue) === '0' ? [arbitraryValue] : [];
        }

        if (isEmpty(propertyValue) && required && (!filterKey || filterKey !== propertyName)) {
          message.warn(i18n.t('missing {name}', { name: displayName }));
          return false;
        }
      }
    }
    return true;
  };

  const focusOnFields = (fieldKey: string) => {
    metaFieldsRef?.current?.onFocus(fieldKey);
  };

  const setField = (value: Obj<any>) => {
    const formattedValue = value;

    // 处理 issueManHour
    if (has(value, 'issueManHour')) {
      formattedValue.issueManHour = merge({}, formData.issueManHour, value.issueManHour);
    }

    const params: ISSUE.IssueType = merge({}, formData, formattedValue);

    if (value.labels) {
      params.labels = value.labels;
    }
    if (has(value, 'planFinishedAt') && !value.planFinishedAt) {
      params.planFinishedAt = ''; // replace null to mark delete
    }
    if (has(value, 'planStartedAt') && !value.planStartedAt) {
      params.planStartedAt = '';
    }

    if ([ISSUE_TYPE.TASK, ISSUE_TYPE.BUG].includes(issueType)) {
      const warnMessage = [];
      if (value.state && isEditMode) {
        setTempStateData(value.state);
        // 编辑模式下修改状态时，必填时间追踪和预估工时, 任务类型
        if (!params.taskType && issueType === ISSUE_TYPE.TASK) {
          warnMessage.push({ msg: i18n.t('dop:missing task type'), key: 'taskType' });
        }
        if (!params.issueManHour.estimateTime) {
          warnMessage.push({ msg: i18n.t('dop:EstimateTime'), key: 'issueManHour.estimateTime' });
        }
        if (params.issueManHour.elapsedTime === 0 && params.issueManHour.thisElapsedTime === 0) {
          // filter out the working
          const workingState = formData.issueButton.find((item) => item.stateBelong === 'WORKING');
          // When working exists and select working, don't warn
          if (!workingState || value.state !== workingState.stateID) {
            warnMessage.push({ msg: i18n.t('dop:time spent in time tracing'), key: 'issueManHour.elapsedTime' });
          }
        }
      }
      if (warnMessage.length !== 0) {
        message.warn(
          <>
            <span className="font-bold">{map(warnMessage, 'msg').join(', ')}</span>
            <span>{i18n.t('dop:missing')}</span>
          </>,
        );
        focusOnFields(warnMessage[0].key);
        return false;
      }
    }
    // after validation, then set temp state in data. prevent enter line 857. see erda bug #235076
    if (has(value, 'issueManHour') && tempStateData) {
      formattedValue.state = tempStateData;
      setTempStateData('');
    }

    let promise;
    let customFieldKey = '';
    let customFieldValue: any;
    map(Object.keys(value), (k) => {
      customFieldKey = k;
      if (!(['planFinishedAt', 'planStartedAt'].includes(k) && !value[k])) {
        params[k] = value[k];
      }
      customFieldValue = value[k];
    });
    const customFieldData = find(customFormData?.property, (item) => item.propertyName === customFieldKey);
    const tempCustomFormData: ISSUE.ICreateField = produce(customFormData, (draft: any) => {
      map(draft?.property, (draftData) => {
        if (draftData.propertyName === customFieldKey) {
          if (FIELD_WITH_OPTION[draftData?.propertyType]) {
            const _values = customFieldValue || [];
            // eslint-disable-next-line no-param-reassign
            draftData.values = Array.isArray(_values) ? _values : [_values];
          } else if (draftData?.propertyType === 'Number') {
            // eslint-disable-next-line no-param-reassign
            draftData.arbitraryValue = Number(customFieldValue);
          } else {
            // eslint-disable-next-line no-param-reassign
            draftData.arbitraryValue = customFieldValue;
          }
        }
      });
    });
    setCustomFormData(tempCustomFormData);

    if (isEditMode) {
      setHasEdited(true);
      if (dataCheck({ ...params, customUrl })) {
        params.iterationID = +(params.iterationID as number) || -1;
        if (tempDescContent) {
          params.content = tempDescContent;
        }
        if (!customFieldValues?.hasOwnProperty(customFieldKey)) {
          savingRef.current = true;
          promise = updateIssue({ ...params, customUrl }).then(() => {
            getIssueStreams({ type: issueType, id: id as number, pageNo: 1, pageSize: 100 });
            getIssueDetail({ type: issueType, id: id as number }).then(() => {
              savingRef.current = false;
            });
            // setHasEdited(false); // 更新后置为false
          });
        } else {
          addFieldsToIssue(
            { ...tempCustomFormData, orgID, projectID: +addRelatedMattersProjectId },
            { customMsg: i18n.t('updated successfully') },
          ).then(() => {
            getCustomFields();
          });
        }
      }
      if (!checkFieldNotEmpty(customFieldData?.propertyType, customFieldValue) && customFieldData?.required) {
        const name = customFieldData?.displayName;
        message.warn(i18n.t('missing {name}', { name }));

        focusOnFields(name);
        return;
      }

      if (!checkCustomFormData(customFieldKey)) return;
    }
    setFormData(params);

    return promise;
  };

  const setFieldCb = (value: Obj<any>, fieldType?: string) => {
    if (fieldType && fieldType === 'markdown') {
      setTempDescContent(value?.content);
      return;
    }
    if (value.labels) {
      const labelName = cloneDeep(value.labels).pop();
      if (isEmpty(value.labels) || includes(labelNames, labelName)) {
        setField(value);
      } else {
        message.info(i18n.t('dop:the label does not exist, please select again'));
        setField({ ...value, labels: value.labels.slice(0, -1) }); // remove the last label, which is not exist
      }
    } else {
      setField(value);
    }
  };

  const onClose = (isCreate = false, isDelete = false) => {
    if (savingRef.current) return;
    setFormData(defaultFormData);
    closeDrawer({ hasEdited, isCreate, isDelete });
    setTempDescContent('');
    setIssueType(propsIssueType);
    setHasEdited(false);
    setIsLoading(false);
    updateSearch({
      id: undefined,
    });
    setCustomFormData(customFieldDetail);
    isEditMode && issueType && clearIssueDetail(issueType);
  };

  const onDelete = () => {
    id &&
      deleteIssue(id).then(() => {
        onClose(false, true);
      });
  };

  const handleSubmit = (isCopy = false, copyTitle = '') => {
    if (!dataCheck(formData)) return;
    if (!checkCustomFormData()) return;
    setDisableSubmit(true);
    const params: ISSUE.IssueType = {
      projectID: Number(projectId),
      iterationID, // keep it first, allow form overwrite iterationID
      ...formData,
      type: issueType,
    };
    params.iterationID = +(params.iterationID as number) || -1; // 需求池指定迭代为-1
    isBug && !(params as ISSUE.Bug).owner && ((params as ISSUE.Bug).owner = params.assignee); // 责任人暂时默认设为处理人

    if (isCopy) {
      const { creator, ...restFormData } = formData;
      copyIssue({
        ...restFormData,
        title: copyTitle,
        issueManHour: { ...formData.issueManHour, elapsedTime: undefined },
        customUrl,
      })
        .then((res) => {
          addFieldsToIssue(
            { ...customFormData, issueID: res, projectID: params.projectID },
            { customMsg: i18n.t('copied successfully') },
          );
          onClose(true);
        })
        .finally(() => {
          setDisableSubmit(false);
        });
      return;
    }

    if (id) {
      updateIssue({
        ...formData,
        issueManHour: { ...formData.issueManHour, elapsedTime: undefined },
        customUrl,
      }).then(() => {
        onClose();
      });
    } else {
      createIssue({ ...params, customUrl }, { hideActionMsg: true })
        .then((res) => {
          savingRef.current = false;
          addFieldsToIssue(
            { ...customFormData, issueID: res, projectID: params.projectID },
            { customMsg: i18n.t('created successfully') },
          );
          onClose(true);
        })
        .finally(() => {
          setDisableSubmit(false);
        });
    }
  };

  const ref = React.useRef(null);

  const switchType = (currentType: string) => {
    setIsLoading(true);
    updateType({ id: formData.id, type: currentType }).then(() => {
      setHasEdited(true);
      setIssueType(currentType as ISSUE_TYPE);
      setIsLoading(false);
    });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    iterationStore.effects
      .createIssue({
        // 创建事件
        projectID: +addRelatedMattersProjectId,
        iterationID: -1,
        type: key,
        priority: 'NORMAL',
        title: issueDetail.title,
        content: issueDetail.content,
      })
      .then((res: number) => {
        addRelation(res); // 添加关联
      });
  };

  const addRelation = (val: number) => {
    addIssueRelation({
      relatedIssues: val,
      id: issueDetail.id,
      projectId: +addRelatedMattersProjectId,
      type: 'connection',
    }).then(() => {
      setHasEdited(true);
      const refObj = ref.current as any;
      if (ref && refObj) {
        refObj.getList();
      }
    });
  };

  const addQuickIssueAuth = usePerm((s) => s.project.requirement.create.pass); // 目前迭代、任务、缺陷添加权限都一致

  let footer: any = [];
  if (isEditMode && issueType === ISSUE_TYPE.TICKET) {
    if (addQuickIssueAuth) {
      footer = [
        <Dropdown
          key="quick-add"
          overlay={
            <Menu onClick={handleMenuClick}>
              <Menu.Item key="REQUIREMENT">
                <IssueIcon type="REQUIREMENT" withName />
              </Menu.Item>
              <Menu.Item key="TASK">
                <IssueIcon type="TASK" withName />
              </Menu.Item>
              <Menu.Item key="BUG">
                <IssueIcon type="BUG" withName />
              </Menu.Item>
            </Menu>
          }
        >
          <Button className="mr-2">{i18n.t('dop:one click to backlog')}</Button>
        </Dropdown>,
      ];
    } else {
      footer = [
        <WithAuth key="create" pass={addQuickIssueAuth}>
          <Button className="mr-2">{i18n.t('dop:one click to backlog')}</Button>
        </WithAuth>,
      ];
    }
  }

  if (!isEditMode) {
    footer = (isChanged: boolean, confirmCloseTip: string | undefined) => [
      <div key="holder" />,
      <Spin key="submit" spinning={updateIssueLoading}>
        <div>
          {isChanged && confirmCloseTip ? (
            <Popconfirm title={confirmCloseTip} placement="topLeft" onConfirm={() => onClose()}>
              <Button>{i18n.t('cancel')}</Button>
            </Popconfirm>
          ) : (
            <Button onClick={() => onClose()}>{i18n.t('cancel')}</Button>
          )}

          <Button disabled={disableSubmit} onClick={() => handleSubmit()} type="primary">
            {i18n.t('ok')}
          </Button>
        </div>
      </Spin>,
    ];
  }

  footer = typeof footer === 'function' ? footer : footer.length ? <>{footer}</> : undefined;
  const relationData = getIssueRelation.useData();

  return (
    <IssueDrawer
      editMode={isEditMode}
      visible={visible}
      loading={isLoading || updateIssueLoading}
      onClose={() => onClose()}
      onDelete={isEditMode ? onDelete : undefined}
      shareLink={shareLink}
      subDrawer={subDrawer}
      canDelete={deleteAuth && !isMonitorTicket}
      canCreate={createAuth}
      confirmCloseTip={isEditMode ? undefined : i18n.t('dop:The new data will be lost if closed. Continue?')}
      handleCopy={handleSubmit}
      maskClosable={isEditMode}
      data={formData}
      projectId={projectId}
      issueType={issueType}
      setData={setFormData}
      footer={footer}
      // loading={
      //   loading.createIssue || loading.getIssueDetail || loading.updateIssue
      // }
    >
      <div className="flex items-center">
        <IF check={isEditMode}>
          {[ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK, ISSUE_TYPE.BUG].includes(issueType) ? (
            <WithAuth pass={switchTypeAuth}>
              <EditField
                name="type"
                type="select"
                noPadding
                data={formData}
                itemProps={{
                  options: getIssueTypeOption(issueType),
                  optionLabelProp: 'data-icon',
                  dropdownMatchSelectWidth: false,
                  allowClear: false,
                  showArrow: true,
                  size: 'small',
                  className: 'switch-type-selector bg-default-06',
                  style: { width: 60 },
                  getPopupContainer: () => document.body,
                }}
                onChangeCb={(field: any) => {
                  switchType(field.type);
                }}
              />
            </WithAuth>
          ) : (
            <span className="mr-2 flex items-center h-full">{ISSUE_TYPE_MAP[issueType]?.icon}</span>
          )}
          <IF.ELSE />
          <IssueIcon type={issueType} withName />
        </IF>
        {relationData?.beIncluded?.[0] && (
          <>
            <ErdaIcon className="mx-2 text-sub" type="right" size="16px" />
            <div className="inline-flex items-center bg-default-06 rounded-sm px-2">
              <ErdaIcon className="mr-1" type="xuqiu" size="20px" />
              {relationData?.beIncluded?.[0].title}
            </div>
          </>
        )}
      </div>
      <div className="mt-1">
        <EditField
          name="title"
          onChangeCb={setFieldCb}
          data={formData}
          disabled={!editAuth}
          className="flex-1 ml-[-8px] mr-[-8px]"
          itemProps={{
            className: 'text-xl text-normal px-2',
            maxLength: 255,
            autoFocus: true,
            placeholder: specialProps.titlePlaceHolder,
          }}
        />
        <IssueMetaFields
          ref={metaFieldsRef}
          projectId={projectId}
          labels={labels}
          isEditMode={isEditMode}
          issueType={issueType}
          isBacklog={isBacklog}
          ticketType={ticketType}
          editAuth={editAuth}
          formData={formData}
          setFieldCb={setFieldCb}
        />
      </div>

      <div className="flex flex-col h-full">
        <div className="mb-2 flex-h-center">
          <ErdaIcon size={16} type="xiangqingneirong" className="text-default-6 mr-1" />
          <span className="text-default-6">{i18n.t('detail')}</span>
        </div>
        <EditField
          name="content"
          disabled={!editAuth}
          placeHolder={i18n.t('dop:no content yet')}
          type="markdown"
          onChangeCb={setFieldCb}
          itemProps={{
            className: 'w-full',
            hasEdited,
            isEditMode,
            maxLength: 3000,
            defaultMode: isEditMode ? 'html' : 'md',
          }} // 编辑时默认显示预览
          data={formData}
        />
      </div>
      <If condition={isEditMode}>
        <div className="space-y-4 pr-4">
          <FullIssueRelation
            issueType={issueType}
            issueDetail={issueDetail}
            iterationID={iterationID}
            setHasEdited={setHasEdited}
          />

          <If condition={issueType === ISSUE_TYPE.BUG}>
            <IssueTestCaseRelation list={testPlanCaseRels || []} />
          </If>
          <If condition={issueType !== ISSUE_TYPE.TICKET}>
            <AddMrRelation
              issueDetail={issueDetail}
              afterAdd={() => getIssueStreams({ type: issueType, id: id as number, pageNo: 1, pageSize: 100 })}
              editAuth={editAuth}
            />
          </If>
        </div>
        <IssueActivities
          type={issueType}
          bottomSlot={
            <IssueCommentBox onSave={(content) => addIssueStream(issueDetail, { content })} editAuth={editAuth} />
          }
        />
      </If>
    </IssueDrawer>
  );
};

export default EditIssueDrawer;
