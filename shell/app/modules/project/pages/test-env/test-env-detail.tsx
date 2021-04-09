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

import { isPlainObject, map, forEach, isEmpty } from 'lodash';
import React from 'react';
import i18n from 'i18n';
import { Input, Select, Table } from 'nusi';
import { KVPair, ProtocolInput, FormModal, InputSelect } from 'common';
import testEnvStore from 'project/stores/test-env';
import routeInfoStore from 'common/stores/route';
import { insertWhen } from 'common/utils';
import { scopeMap } from 'project/common/components/pipeline-manage/config';

const { Option } = Select;

const headerList = [
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Datetime',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Cookie',
  'Content-Disposition',
  'Content-Length',
  'Content-MD5',
  'Content-Type',
  'Date',
  'Expect',
  'From',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'TE',
  'User-Agent',
  'Upgrade',
  'Via',
  'Warning',
  'X-Requested-With',
  'DNT',
  'X-Forwarded-For',
  'X-Forwarded-Host',
  'X-Forwarded-Proto',
  'Front-End-Https',
  'X-Http-Method-Override',
  'X-ATT-DeviceId',
  'X-Wap-Profile',
  'Proxy-Connection',
  'X-UIDH',
  'X-Csrf-Token',
];

const typeMap = {
  manual: {
    string: 'string',
    integer: 'integer',
    float: 'float',
    boolean: 'boolean',
    list: 'list',
  },
  auto: {
    string: 'string',
  },
};

const transObjToList = (obj: object) => {
  if (!isPlainObject(obj)) {
    return obj;
  }
  const list: Obj[] = [];
  map(obj, (v: string, k: string) => { list.push({ key: k, value: v }); });
  return list;
};

const transHeader = (list: any[]) => {
  if (!Array.isArray(list)) {
    return list;
  }
  const obj = {};
  map(list, (item) => {
    if (item.key || item.value) {
      obj[item.key] = item.value;
    }
  });
  return obj;
};

const transGlobal = (list: any[]) => {
  if (!Array.isArray(list)) {
    return list;
  }
  const obj = {};
  map(list, (item) => {
    if (item.key || item.value) {
      obj[item.key] = {
        value: item.value,
        type: item.type || typeMap.auto.string,
        desc: item.desc,
      };
    }
  });
  return obj;
};

const KVPairTable = (props: any) => {
  const { value, disabled } = props;
  const columns = [
    {
      title: i18n.t('project:name'),
      dataIndex: 'Key',
      width: 200,
    },
    {
      title: i18n.t('project:parameter content'),
      dataIndex: 'Value',
    },
    {
      title: i18n.t('project:operation'),
      key: 'op',
      width: 80,
      render: (_: any, record: any) => (record.isLast ? null : record.Op),
    },
  ];

  const _value: any = map(transObjToList(value), (item) => {
    const newItem = {};
    forEach(item, (v, k) => {
      if (isPlainObject(v)) {
        forEach(v as Obj, (subV: string, subK: string) => {
          newItem[subK] = subV;
        });
      } else {
        newItem[k] = v;
      }
    });
    return newItem;
  });

  if (props.KeyDescComp) {
    columns.splice(2, 0, {
      title: i18n.t('description'),
      dataIndex: 'KeyDescComp',
      width: 150,
    });
  }
  if (props.DescComp) {
    columns.splice(1, 0, {
      title: i18n.t('project:paramType'),
      dataIndex: 'Desc',
      width: 150,
    });
  }

  return (
    <KVPair {...props} value={_value} emptyHolder={!disabled} autoAppend={!disabled} compProps={{ disabled }}>
      {
        ({ CompList }: any) => {
          const data = CompList.map((d: any, index: number) => ({
            index,
            ...CompList[index],
            isLast: index === CompList.length - 1,
          }));
          return (
            <Table
              rowKey={'index'}
              columns={columns}
              pagination={false}
              dataSource={data}
            />
          );
        }
      }
    </KVPair>
  );
};


interface IProps {
  visible: boolean,
  data: TEST_ENV.Item | Obj,
  disabled: boolean,
  envID: number,
  envType: TEST_ENV.EnvType,
  onCancel(): any,
}

const headerListOption = headerList.map(o => ({ label: o, value: o }));
export const TestEnvDetail = (props: IProps) => {
  const { data, disabled, visible, onCancel, envID, envType } = props;
  const { testType = 'manual' } = routeInfoStore.useStore(s => s.params);
  const HeaderKeyComp = ({ record, update, ...rest }: any) => {
    return (
      <InputSelect
        options={headerListOption}
        value={record.key}
        onChange={update}
      />
    );
    // return (
    //   <Select value={record.key} showSearch allowClear onChange={update} {...rest}>
    //     {
    //       headerList.map(o => <Option key={o} value={o}>{o}</Option>)
    //     }
    //   </Select>
    // );
  };

  const GlobalKeyComp = ({ record, update, ...rest }: any) => (
    <Input
      value={record.key}
      onChange={e => update(e.target.value.trim())}
      maxLength={500}
      {...rest}
    />
  );

  const GlobalDescComp = ({ record, update, ...rest }: any) => (
    <Select value={record.type || typeMap[testType].string} allowClear onChange={update} {...rest}>
      {map(typeMap[testType], (value, key) => <Option key={key} value={value}>{value}</Option>)}
    </Select>
  );

  const KeyDescComp = ({ record, keyDesc, update, ...rest }: any) => (
    <Input maxLength={3000} value={record[keyDesc]} onChange={e => update(e.target.value)} {...rest} />
  );

  const ValueComp = ({ record, valueName, update, ...rest }: any) => (
    <Input maxLength={3000} value={record[valueName]} onChange={e => update(e.target.value)} {...rest} />
  );

  const fieldsList = [
    ...insertWhen(testType === 'auto', [
      {
        label: i18n.t('application:name'),
        name: 'displayName',
        itemProps: {
          maxLength: 191,
          disabled,
        },
      },
      {
        label: i18n.t('application:description'),
        name: 'desc',
        type: 'textArea',
        itemProps: {
          maxLength: 512,
          disabled,
        },
      },
    ]),
    ...insertWhen(testType === 'manual', [
      {
        label: i18n.t('project:environment name'),
        name: 'name',
        itemProps: {
          maxLength: 50,
          disabled,
        },
      },
    ]),
    {
      label: i18n.t('project:environmental domain name'),
      name: 'domain',
      getComp: () => <ProtocolInput disabled={disabled} />,
      required: false,
    },
    {
      getComp: () => <div className="bold">Header</div>,
      extraProps: {
        className: 'mb8',
      },
    },
    {
      name: 'header',
      required: false,
      getComp: () => <KVPairTable disabled={disabled} KeyComp={HeaderKeyComp} ValueComp={ValueComp} />,
    },
    {
      getComp: () => <div className="bold">global</div>,
      extraProps: {
        className: 'mb8',
      },
    },
    {
      name: 'global',
      required: false,
      getComp: () => <KVPairTable disabled={disabled} KeyComp={GlobalKeyComp} DescComp={GlobalDescComp} descName="type" KeyDescComp={KeyDescComp} keyDesc='desc' />,
    },
  ];

  const onUpdateHandle = React.useCallback((values, header, global) => {
    if (testType === 'manual') {
      testEnvStore.updateTestEnv({ ...values, id: data.id, header, global, envType, envID }, { envType, envID });
    } else {
      testEnvStore.updateAutoTestEnv({
        apiConfig: {
          domain: values.domain,
          name: values.name,
          header,
          global,
        },
        scope: scopeMap.autoTest.scope,
        scopeID: String(envID),
        ns: data.ns,
        displayName: values.displayName,
        desc: values.desc,
      });
    }
  }, [data, envID, envType, testType]);

  const onCreateHandle = React.useCallback((values, header, global) => {
    if (testType === 'manual') {
      testEnvStore.createTestEnv({ ...values, header, global, envType, envID }, { envType, envID });
    } else {
      testEnvStore.createAutoTestEnv({
        apiConfig: {
          ...values,
          header,
          global,
        },
        scope: scopeMap.autoTest.scope,
        scopeID: String(envID),
        displayName: values.displayName,
        desc: values.desc,
      }, { scope: scopeMap.autoTest.scope, scopeID: envID });
    }
  }, [envID, envType, testType]);

  const handleSubmit = (values: any) => {
    if (disabled) {
      onCancel();
      return;
    }
    const header = transHeader(values.header);
    const global = transGlobal(values.global);

    if (!isEmpty(data)) {
      onUpdateHandle(values, header, global);
    } else {
      onCreateHandle(values, header, global);
    }
    onCancel();
  };

  return (
    <FormModal
      name={i18n.t('project:parameter configuration')}
      visible={visible}
      width={900}
      formData={data}
      fieldsList={fieldsList}
      onOk={handleSubmit}
      onCancel={onCancel}
      formProps={{ layout: 'vertical' }}
    />
  );
};
