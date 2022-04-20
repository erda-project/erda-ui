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
import { Transfer, Spin, Button, Tooltip } from 'antd';
import { isEqual } from 'lodash';
import { Icon as CustomIcon } from 'common';
import { connectCube } from 'common/utils';
import i18n from 'i18n';
import dataTaskStore from 'application/stores/dataTask';
import { useEffectOnce } from 'react-use';
import { useLoading } from 'core/stores/loading';

import './data-task-creation.scss';

interface IProps {
  workFlowFiles: IFile[];
  isFetching: boolean;
  onOk: any;
  onCancel: any;
  modal: any;
}

interface IState {
  selectedKeys?: string[];
  targetKeys?: string[];
  sourceFiles?: IFile[];
  prevProps?: IProps;
}

interface IFile {
  key: string;
  title: string;
  disabled?: boolean;
}

class DataTaskCreation extends React.PureComponent<IProps, IState> {
  readonly state = {
    targetKeys: [] as string[],
    sourceFiles: [] as IFile[],
    selectedKeys: [] as string[],
  };

  static getDerivedStateFromProps(props: IProps, state: IState) {
    const nextState: IState = { prevProps: props };
    if (!isEqual(props, state.prevProps)) {
      nextState.sourceFiles = props.workFlowFiles;
    }
    return nextState;
  }

  handleChange = (targetKeys: string[]) => {
    this.setState({ targetKeys });
  };

  renderItem = ({ title }: any) => {
    return {
      label: <Tooltip title={title}>{title}</Tooltip>, // for displayed item
      value: title, // for title and filter matching
    };
  };

  onOk = () => {
    const { onOk } = this.props;
    const { targetKeys } = this.state;
    onOk(targetKeys);
  };

  onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    const { targetKeys } = this.state;
    if (sourceSelectedKeys.length + targetKeys.length > 10) {
      return;
    }
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  };

  render() {
    const { isFetching, onCancel } = this.props;
    const { targetKeys, sourceFiles, selectedKeys } = this.state;
    return (
      <div className="data-task">
        <Spin spinning={isFetching}>
          <Transfer
            rowKey={(record) => record.title}
            showSearch
            className="data-task-transfer"
            dataSource={sourceFiles}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleChange}
            render={this.renderItem}
            listStyle={{ width: 352, height: 482 }}
            onSelectChange={this.onSelectChange}
          />
          <section className="footer flex justify-between items-center mt-5">
            <span>
              <CustomIcon type="jg" />
              {i18n.t('dop:can only add up to 10 files at a time')}
            </span>
            <div>
              <Button className="ml-2" onClick={onCancel}>
                {i18n.t('Cancel')}
              </Button>
              <Button className="ml-2" type="primary" onClick={this.onOk}>
                {i18n.t('OK')}
              </Button>
            </div>
          </section>
        </Spin>
      </div>
    );
  }
}

const Mapper = () => {
  const workFlowFiles = dataTaskStore.useStore((s) => s.workFlowFiles);
  const [isFetching] = useLoading(dataTaskStore, ['getWorkFlowFiles']);
  const { getWorkFlowFiles } = dataTaskStore.effects;
  const { clearWorkFlowFiles } = dataTaskStore.reducers;

  useEffectOnce(() => {
    getWorkFlowFiles();
    return () => clearWorkFlowFiles();
  });

  return {
    workFlowFiles,
    isFetching,
  };
};

const DataTaskCreationWrapper = connectCube(DataTaskCreation, Mapper);
export { DataTaskCreationWrapper as DataTaskCreation };
