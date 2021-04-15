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
import { Drawer } from 'app/nusi';
import i18n from 'i18n';
import { get } from 'lodash';
import { PipelineGraphicEditor } from 'app/yml-chart/common/pipeline-graphic-editor';
import { CaseNodeForm as CaseActionForm } from './case-node-form';
import './case-yml-graphic-editor.scss';

interface ICaseNodeDrawer {
  nodeData: null | AUTO_TEST.ICaseDetail;
  editing: boolean;
  isCreate?: boolean;
  addDrawerProps: Obj;
  otherTaskAlias?: string[];
  onSubmit?: (options: any) => void;
  closeDrawer: () => void;
  visible: boolean;
  scope: string;
}

const CaseNodeDrawer = (props: ICaseNodeDrawer) => {
  const { visible, editing, nodeData: propsNodeData, isCreate, closeDrawer } = props;

  let title = i18n.t('application:new node');
  if (!isCreate) {
    title = `${editing ? i18n.t('edit') : i18n.t('common:view')} ${get(propsNodeData, 'alias') || ''}`;
  }
  const [key, setKey] = React.useState(1);


  React.useEffect(() => {
    setKey(prev => prev + 1);
  }, [visible]);

  return (
    <Drawer
      width={560}
      visible={visible}
      onClose={closeDrawer}
      maskClosable={!editing}
      title={title}
      destroyOnClose
      className='case-node-drawer'
    >
      <CaseActionForm key={key} {...props} />
    </Drawer>
  );
};


const CaseYmlGraphicEditor = (props: any) => {
  const { addDrawerProps, scope } = props;
  return (
    <PipelineGraphicEditor
      {...props}
      PipelineNodeDrawer={(p:any) => <CaseNodeDrawer {...p} addDrawerProps={addDrawerProps} scope={scope} />}
    />
  );
};

export default CaseYmlGraphicEditor;
