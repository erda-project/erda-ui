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
import { Modal, Table } from 'app/nusi';
import { ColumnProps } from 'core/common/interface';
import i18n from 'i18n';
import { RenderForm } from 'common';
import middlewareDashboardStore from 'dataCenter/stores/middleware-dashboard';
import { useLoading } from 'core/stores/loading';

interface IProps {
  visible: boolean;
  formData: MIDDLEWARE_DASHBOARD.IMiddleBase;
  onCancel: () => void;
}

const RestoreModal = ({ visible, formData, onCancel }: IProps) => {
  const [backupFiles, setBackupFiles] = React.useState([]);
  const [isFetch] = useLoading(middlewareDashboardStore, ['getBackupFiles']);
  React.useEffect(() => {
    if (visible) {
      middlewareDashboardStore.effects.getBackupFiles((res) => {
        setBackupFiles(res.backupfile);
      });
    }
  }, [visible]);
  const canRestore = React.useMemo(() => {
    return backupFiles.every((file) => file.status);
  }, [backupFiles]);
  const handleRestore = () => {};
  const columns: Array<ColumnProps<any>> = [
    {
      title: i18n.t('default:name'),
      dataIndex: 'name',
      width: 280,
    },
    {
      title: '',
      dataIndex: 'status',
      width: 100,
    },
    {
      title: '',
      key: 'op',
      width: 100,
      render: () => {
        return (
          <div className="table-operations">
            {canRestore ? (
              <span className="table-operations-btn" onClick={handleRestore}>
                {i18n.t('default:restore')}
              </span>
            ) : (
              <span>{i18n.t('default:restore')}</span>
            )}
          </div>
        );
      },
    },
  ];
  const fieldsList = [
    {
      label: i18n.t('default:name'),
      required: true,
      name: 'name',
      initialValue: formData.name,
      itemProps: {
        disabled: true,
      },
    },
  ];
  return (
    <Modal visible={visible} title={i18n.t('default:restore')} onCancel={onCancel}>
      <RenderForm layout="vertical" list={fieldsList} />
      <Table loading={isFetch} columns={columns} dataSource={backupFiles} pagination={false} />
    </Modal>
  );
};

export default RestoreModal;
