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
import { CRUDStoreTable, DeleteConfirm, Icon as CustomIcon, useUpdate } from 'common';
import i18n from 'i18n';
import certificateStore from '../../stores/certificate';
import { Upload, message, Button, Icon, Select, Input } from 'app/nusi';
import { formatTime } from 'common/utils';
import { WrappedFormUtils } from 'core/common/interface';
import { get, map } from 'lodash';
import './index.scss';
import { getUploadProps } from 'common/utils/upload-props';
import DetailModal from './detail-modal';
import orgStore from 'app/org-home/stores/org';

const { Option } = Select;
export const typeMap = {
  IOS: { value: 'IOS', label: 'IOS' },
  Android: { value: 'Android', label: 'Android' },
  // Message: { value: 'Message', label: i18n.t('message') },
};

interface IFileChangeArg {
  uuid: string | undefined;
  fileName: string | undefined;
}
interface IUploadProps {
  form: WrappedFormUtils;
  onChangeFile:({ uuid, fileName }: IFileChangeArg)=> void;
  fileNameKey: string;
  fileAccept: string;
}
const getUploadComp = ({ form, onChangeFile, fileNameKey, fileAccept }: IUploadProps) => {
  const acceptProp = { accept: fileAccept };
  const uploadProps = getUploadProps({
    ...acceptProp,
    data: {
      fileFrom: 'certificate manager',
    },
    onChange: ({ file }: any) => {
      if (file.response) {
        const { success, err, data } = file.response;
        if (!success) {
          message.error(err.msg);
        } else {
          onChangeFile({ uuid: data.uuid, fileName: data.name });
        }
      }
      return file;
    },
  });
  const deleteFile = () => {
    onChangeFile({ uuid: undefined, fileName: undefined });
  };
  const fileName = form.getFieldValue(fileNameKey);
  return (
    <div className="upload-container">
      <Upload {...uploadProps}>
        <Button>
          <Icon type="upload" /> {i18n.t('upload')}
        </Button>
      </Upload>
      {fileName && (
        <div className="flex-box upload-file-item nowrap">
          <span>{fileName}</span>
          <CustomIcon type="thin-del" className="hover-active" onClick={deleteFile} />
        </div>
      )
      }
    </div>
  );
};

export const keyPrefix = {
  iosDebug: 'iosInfo.debugProvision',
  iosKeyChainP12: 'iosInfo.keyChainP12',
  iosRelease: 'iosInfo.releaseProvision',
  adrAuto: 'androidInfo.autoInfo',
  adrManualDebug: 'androidInfo.manualInfo.debugKeyStore',
  adrManualRelease: 'androidInfo.manualInfo.releaseKeyStore',
};

const getUploadFieldProps = ({ form, onChangeFile, fileNameKey, fileAccept }: IUploadProps) => {
  return {
    rules: [
      { required: true, message: i18n.t('common:Please select the file to be uploaded') },
    ],
    config: {
      getValueFromEvent: (e: any) => {
        if (Array.isArray(e)) return e;
        return e && e.fileList;
      },
    },
    getComp: () => {
      return getUploadComp({ form, onChangeFile, fileNameKey, fileAccept });
    },
  };
};

const Certificate = () => {
  const [{ chosenType, manualCreate, chosenRowId }, updater, update] = useUpdate({
    chosenType: '',
    manualCreate: 'true',
    detailVis: false,
    detail: {} as Certificate.Detail,
    chosenRowId: undefined as undefined | number,
  });
  const orgId = orgStore.useStore(s => s.currentOrg.id);
  const getColumns = (effects: any, { onEdit, reloadList }: any) => {
    const { deleteItem } = effects;
    const columns = [
      {
        title: i18n.t('name'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: i18n.t('description'),
        dataIndex: 'desc',
      },
      {
        title: i18n.t('type'),
        dataIndex: 'type',
        width: 140,
        render: (text: string) => typeMap[text] && typeMap[text].label,
      },
      {
        title: i18n.t('creation time'),
        dataIndex: 'createdAt',
        width: 180,
        render: (text: string) => formatTime(text),
      },
      {
        title: i18n.t('operation'),
        dataIndex: 'op',
        width: 160,
        render: (_v: any, record: Certificate.Detail) => {
          return (
            <div className="table-operations">
              {
                record.type === 'Message' ? (
                  <a
                    className="table-operations-btn"
                    download={get(record, 'messageInfo.uuid')}
                    href={`/api/files/${get(record, 'messageInfo.uuid')}`}
                  >
                    {i18n.t('download')}
                  </a>
                ) : (
                  <span
                    className="table-operations-btn"
                    onClick={() => updater.chosenRowId(record.id)}
                  >
                    {i18n.t('download')}
                  </span>
                )
              }
              {/* <span className="table-operations-btn" onClick={() => onEdit(record)}>{i18n.t('edit')}</span> */}
              <DeleteConfirm title={i18n.t('delete certificate')} secondTitle={i18n.t('org:confirm-delete-certificate')} onConfirm={() => deleteItem(record).then(() => reloadList())}>
                <span className="table-operations-btn">{i18n.t('delete')}</span>
              </DeleteConfirm>
            </div>
          );
        },
      },
    ];
    return columns;
  };
  const getFieldsList = (form: WrappedFormUtils, isEdit: boolean) => {
    const basicFieldsList = [
      {
        name: 'id',
        itemProps: {
          type: 'hidden',
        },
      },
      {
        label: i18n.t('name'),
        name: 'name',
        itemProps: {
          maxLength: 100,
          disabled: isEdit,
        },
      },
      {
        label: i18n.t('description'),
        name: 'desc',
        required: false,
        itemProps: {
          maxLength: 1000,
        },
      },
      {
        label: i18n.t('type'),
        name: 'type',
        type: 'custom',
        itemProps: {
          disabled: isEdit,
          onChange: (val: string) => {
            updater.chosenType(val);
          },
        },
        getComp: () => {
          const curValue = form.getFieldValue('type');
          return (
            <Select
              placeholder={i18n.t('please select')}
              onSelect={e => { curValue !== e && form.resetFields(['filename', 'uuid']); }}
            >
              {
                map(typeMap, ({ value, label }) => (
                  <Option key={value} value={value}>{label}</Option>
                ))
              }
            </Select>
          );
        },
      },
    ];

    const typeFieldsMap = {
      IOS: [
        {
          label: `Keychain-p12 ${i18n.t('file')}`,
          name: `${keyPrefix.iosKeyChainP12}.uuid`,
          type: 'custom',
          ...getUploadFieldProps({
            form,
            onChangeFile: ({ uuid, fileName }:IFileChangeArg) => {
              form.setFieldsValue({
                [`${keyPrefix.iosKeyChainP12}.fileName`]: fileName,
                [`${keyPrefix.iosKeyChainP12}.uuid`]: uuid,
                [`${keyPrefix.iosKeyChainP12}.password`]: undefined, // 每次修改uuid后，需要重置密码
              });
            },
            fileNameKey: `${keyPrefix.iosKeyChainP12}.fileName`,
            fileAccept: '.p12',
          }),
        },
        {
          label: `Keychain-p12 ${i18n.t('password')}`,
          name: `${keyPrefix.iosKeyChainP12}.password`,
          type: 'custom',
          required: false,
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          name: `${keyPrefix.iosKeyChainP12}.fileName`,
          itemProps: {
            type: 'hidden',
          },
        },
        {
          label: `Debug-mobileprovision ${i18n.t('file')}`,
          name: `${keyPrefix.iosDebug}.uuid`,
          type: 'custom',
          ...getUploadFieldProps({
            form,
            onChangeFile: ({ uuid, fileName }:IFileChangeArg) => {
              form.setFieldsValue({
                [`${keyPrefix.iosDebug}.fileName`]: fileName,
                [`${keyPrefix.iosDebug}.uuid`]: uuid,
              });
            },
            fileNameKey: `${keyPrefix.iosDebug}.fileName`,
            fileAccept: '.mobileprovision',
          }),
        },
        {
          name: `${keyPrefix.iosDebug}.fileName`,
          itemProps: {
            type: 'hidden',
          },
        },
        {
          label: `Release-mobileprovision ${i18n.t('file')}`,
          name: `${keyPrefix.iosRelease}.uuid`,
          type: 'custom',
          ...getUploadFieldProps({
            form,
            onChangeFile: ({ uuid, fileName }:IFileChangeArg) => {
              form.setFieldsValue({
                [`${keyPrefix.iosRelease}.fileName`]: fileName,
                [`${keyPrefix.iosRelease}.uuid`]: uuid,
              });
            },
            fileNameKey: `${keyPrefix.iosRelease}.fileName`,
            fileAccept: '.mobileprovision',
          }),
        },
        {
          name: `${keyPrefix.iosRelease}.fileName`,
          itemProps: {
            type: 'hidden',
          },
        },
      ],
      Android: [
        {
          label: i18n.t('microService:create a way'),
          name: 'androidInfo.manualCreate',
          type: 'radioGroup',
          initialValue: 'true',
          itemProps: {
            onChange: (e:any) => {
              updater.manualCreate(e.target.value);
            },
          },
          options: [{ name: i18n.t('manually create'), value: 'true' }, { name: i18n.t('auto create'), value: 'false' }],
        },
      ],
      Message: [
        {
          name: 'messageInfo.fileName',
          itemProps: {
            type: 'hidden',
          },
        },
        {
          label: i18n.t('file'),
          name: 'messageInfo.uuid',
          type: 'custom',
          ...getUploadFieldProps({
            form,
            onChangeFile: ({ uuid, fileName }:IFileChangeArg) => {
              form.setFieldsValue({
                'messageInfo.fileName': fileName,
                'messageInfo.uuid': uuid,
              });
            },
            fileNameKey: 'messageInfo.fileName',
            fileAccept: '',
          }),
        },
      ],
    };

    const createFieldsMap = {
      manual: [
        {
          label: `Debug-key/store ${i18n.t('file')}`,
          name: `${keyPrefix.adrManualDebug}.uuid`,
          type: 'custom',
          ...getUploadFieldProps({
            form,
            onChangeFile: ({ uuid, fileName }:IFileChangeArg) => {
              form.setFieldsValue({
                [`${keyPrefix.adrManualDebug}.fileName`]: fileName,
                [`${keyPrefix.adrManualDebug}.uuid`]: uuid,
                [`${keyPrefix.adrManualDebug}.keyPassword`]: undefined,
                [`${keyPrefix.adrManualDebug}.storePassword`]: undefined,
                [`${keyPrefix.adrManualDebug}.alias`]: undefined,
              });
            },
            fileNameKey: `${keyPrefix.adrManualDebug}.fileName`,
            fileAccept: '.keystore',
          }),
        },
        {
          label: `Debug-key ${i18n.t('org:alias')}`,
          name: `${keyPrefix.adrManualDebug}.alias`,
        },
        {
          label: `Debug-key ${i18n.t('password')}`,
          name: `${keyPrefix.adrManualDebug}.keyPassword`,
          type: 'custom',
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          label: `Debug-store ${i18n.t('password')}`,
          name: `${keyPrefix.adrManualDebug}.storePassword`,
          type: 'custom',
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          name: `${keyPrefix.adrManualDebug}.fileName`,
          itemProps: {
            type: 'hidden',
          },
        },
        {
          label: `Release-key/store ${i18n.t('file')}`,
          name: `${keyPrefix.adrManualRelease}.uuid`,
          type: 'custom',
          ...getUploadFieldProps({
            form,
            onChangeFile: ({ uuid, fileName }:IFileChangeArg) => {
              form.setFieldsValue({
                [`${keyPrefix.adrManualRelease}.fileName`]: fileName,
                [`${keyPrefix.adrManualRelease}.uuid`]: uuid,
                [`${keyPrefix.adrManualRelease}.keyPassword`]: undefined,
                [`${keyPrefix.adrManualRelease}.storePassword`]: undefined,
                [`${keyPrefix.adrManualRelease}.alias`]: undefined,
              });
            },
            fileNameKey: `${keyPrefix.adrManualRelease}.fileName`,
            fileAccept: '.keystore',
          }),
        },
        {
          label: `Release-key ${i18n.t('org:alias')}`,
          name: `${keyPrefix.adrManualRelease}.alias`,
        },
        {
          label: `Release-key ${i18n.t('password')}`,
          name: `${keyPrefix.adrManualRelease}.keyPassword`,
          type: 'custom',
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          label: `Release-store ${i18n.t('password')}`,
          name: `${keyPrefix.adrManualRelease}.storePassword`,
          type: 'custom',
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          name: `${keyPrefix.adrManualRelease}.fileName`,
          itemProps: {
            type: 'hidden',
          },
        },
      ],
      auto: [
        {
          label: `Debug-key ${i18n.t('org:alias')}`,
          name: `${keyPrefix.adrAuto}.debugKeyStore.alias`,
        },
        {
          label: `Debug-key ${i18n.t('password')}`,
          name: `${keyPrefix.adrAuto}.debugKeyStore.keyPassword`,
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          label: `Debug-store ${i18n.t('password')}`,
          name: `${keyPrefix.adrAuto}.debugKeyStore.storePassword`,
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          label: `Release-key ${i18n.t('org:alias')}`,
          name: `${keyPrefix.adrAuto}.releaseKeyStore.alias`,
        },
        {
          label: `Release-key ${i18n.t('password')}`,
          name: `${keyPrefix.adrAuto}.releaseKeyStore.keyPassword`,
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          label: `Release-store ${i18n.t('password')}`,
          name: `${keyPrefix.adrAuto}.releaseKeyStore.storePassword`,
          rules: [
            { pattern: /^[\s\S]{6,30}$/, message: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}` },
          ],
          itemProps: {
            placeholder: `${i18n.t('length is {min}~{max}', { min: 6, max: 30 })}`,
          },
          getComp: () => <Input.Password />,
        },
        {
          label: `${i18n.t('name or surname')}/CN`,
          name: `${keyPrefix.adrAuto}.name`,
        },
        {
          label: `${i18n.t('organization unit')}/OU`,
          name: `${keyPrefix.adrAuto}.ou`,
        },
        {
          label: `${i18n.t('common:organization')}/O`,
          name: `${keyPrefix.adrAuto}.org`,
        },
        {
          label: `${i18n.t('city')}/L`,
          name: `${keyPrefix.adrAuto}.city`,
        },
        {
          label: `${i18n.t('province')}/ST`,
          name: `${keyPrefix.adrAuto}.province`,
        },
        {
          label: `${i18n.t('country')}/C`,
          name: `${keyPrefix.adrAuto}.state`,
        },
      ],
    } as any;

    let fieldsList = basicFieldsList.concat((typeFieldsMap[chosenType] || []));
    if (chosenType === 'Android') {
      fieldsList = fieldsList.concat(createFieldsMap[manualCreate === 'true' ? 'manual' : 'auto']);
    }
    return fieldsList;
  };

  const filterConfig = React.useMemo(() => [
    {
      type: Input,
      name: 'q',
      customProps: {
        placeholder: i18n.t('search by name'),
      },
    },
  ], []);

  const handleFormSubmit = (data: Certificate.Detail, { addItem }: {addItem: (arg: any) => Promise<any>}) => {
    const reData = { ...data, orgId };
    if (reData.androidInfo) {
      reData.androidInfo.manualCreate = `${reData.androidInfo.manualCreate}` === 'true';
    }
    return addItem(reData);
  };


  return (
    <>
      <CRUDStoreTable<Certificate.Detail>
        name={i18n.t('certificate')}
        showTopAdd
        getColumns={getColumns}
        getFieldsList={getFieldsList}
        store={certificateStore}
        handleFormSubmit={handleFormSubmit}
        filterConfig={filterConfig}
        onModalClose={() => {
          update({
            chosenType: '',
            manualCreate: 'true',
          });
        }}
      />
      <DetailModal id={chosenRowId} onClose={() => updater.chosenRowId('')} />
    </>
  );
};

export default Certificate;
