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
// 使用nusi Select
import { Modal, NusiSelect as Select } from 'app/nusi';
import { SelectProps, ModalProps } from 'core/common/interface';
import { Intersection as IconIntersection } from '@icon-park/react'

interface IModalProps<T> extends ModalProps{
  children(data: T[], selectKey: number| undefined, handleChange: (data: number)=>void): React.ReactNode;
  onCancel?(): void;
  onOk?():void
}

interface IProps<T> extends SelectProps<any>{
  dataSource: T[];
  children: React.ReactNode;
  modalProps: IModalProps<T>
  onChange?(data?: number): void;
  onModalShow?():void;
  onModalClose?():void;
}

function SelectPro<T, S>({ value, dataSource, children, modalProps, onChange, onModalShow, onModalClose, ...prop }: IProps<T>) {
  const { onOk, children: modalChildren, ...modalRest } = modalProps || {};
  const [showModal, setShowModal] = React.useState(false);
  const [v, setV] = React.useState<undefined | number>(undefined);
  const [tempV, setTempV] = React.useState<undefined | number>(undefined);
  React.useEffect(() => {
    if (value) {
      setV(+value);
    } else {
      setV(undefined);
    }
  }, [value]);
  const handleModal = () => {
    setTempV(v);
    onModalShow && onModalShow();
    setShowModal(true);
  };
  const handleCancel = () => {
    setShowModal(false);
    onModalClose && onModalClose();
  };
  const handleOk = () => {
    handleChange(tempV);
    onOk && onOk();
    handleCancel();
  };
  const handleChange = (key?: number) => {
    setV(key);
    onChange && onChange(key);
  };
  return (
    <>
      <Select
        value={v}
        style={{ width: '100%' }}
        actionIcon={<IconIntersection className="hover-active mr4" style={{transform: 'translateY(-2px)'}} />}
        onActionClick={handleModal}
        onChange={handleChange}
        {...prop}
      >
        {children}
      </Select>
      <Modal
        {...modalRest}
        visible={showModal}
        onCancel={handleCancel}
        onOk={handleOk}
        destroyOnClose
      >
        {
          modalChildren(dataSource, tempV, setTempV)
        }
      </Modal>
    </>
  );
}
SelectPro.Option = Select.Option;

export default SelectPro;
