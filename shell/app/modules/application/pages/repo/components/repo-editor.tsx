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

import { Button, message, Input } from 'app/nusi';
import * as React from 'react';
import { RenderForm, FileEditor, useUpdate } from 'common';
import { notify } from 'common/utils';
import FileContainer from 'application/common/components/file-container';
import { getInfoFromRefName } from '../util';
import yaml from 'js-yaml';
import i18n from 'i18n';
import repoStore from 'application/stores/repo';
import AddPipelineYml from './add-pipelineyml';
import './repo-editor.scss';

interface IProps {
  name?: string;
  blob?: REPOSITORY.IBlob;
  fileName?: string;
  isDiceOrPipelineFile: boolean;
  autoHeight?: boolean;
  ops: React.ReactNode;
  maxLines?: number;
}

interface IState {
  value?: string;
  blob?: REPOSITORY.IBlob;
  isAddMode?: boolean;
  fileName: string;
}

const RepoEditor = ({
  autoHeight,
  maxLines,
  ops,
  isDiceOrPipelineFile,
  name,
  blob = {} as REPOSITORY.IBlob,
  fileName = '',
}: IProps) => {
  const [state, updater, update] = useUpdate({
    value: '',
    isAddMode: true,
    fileName: '',
  } as IState);
  const [tree, info, mode] = repoStore.useStore((s) => [s.tree, s.info, s.mode]);
  const { commit, getRepoBlob, getRepoTree } = repoStore.effects;
  const { changeMode } = repoStore.reducers;
  React.useEffect(() => {
    update({
      value: blob.content,
      isAddMode: blob.content === undefined,
      fileName: name || fileName || '',
    });
  }, [update, blob.content, name, fileName]);

  if (mode.addFileName === 'pipelineYml') {
    return <AddPipelineYml />;
  }

  const onChange = (value: string) => {
    update({
      value,
    });
  };

  const handleSubmit = (form: any) => {
    const { isAddMode, value } = state;
    const path = isAddMode ? `${tree.path ? `${tree.path}/` : ''}${state.fileName}` : tree.path;

    if (isDiceOrPipelineFile) {
      try {
        yaml.load(value);
      } catch (e) {
        notify('error', `${i18n.t('application:input format error')}：${e.message}`);
        return;
      }
    }

    form.validateFields((error: Error, values: Pick<REPOSITORY.Commit, 'message' | 'branch'>) => {
      if (error) {
        return;
      }
      commit({
        ...values,
        actions: [
          {
            action: isAddMode ? 'add' : 'update',
            content: state.value,
            path,
            pathType: 'blob',
          },
        ],
      }).then((res) => {
        if (res.success) {
          changeMode({ editFile: false, addFile: false });
          if (isAddMode) {
            message.success(i18n.t('application:file created successfully'));
            getRepoTree({ force: true });
          } else {
            message.success(i18n.t('application:file modified successfully'), 2);
            getRepoBlob();
          }
        }
      });
    });
  };

  const getFieldsList = () => {
    const { isAddMode } = state;
    const { branch } = getInfoFromRefName(tree.refName);
    const branches = info.branches.length ? info.branches : ['master'];
    const fieldsList = [
      {
        name: 'message',
        type: 'textArea',
        itemProps: {
          placeholder: i18n.t('application:submit information'),
          maxLength: 200,
          autoSize: { minRows: 3, maxRows: 7 },
        },
        initialValue: isAddMode ? `Add ${state.fileName}` : `Update ${state.fileName}`,
      },
      {
        name: 'branch',
        type: 'select',
        initialValue: branch || 'master',
        options: branches.map((a: string) => ({ name: a, value: a })),
        itemProps: {
          placeholder: i18n.t('application:submit branch'),
          disabled: true,
        },
      },
      {
        getComp: ({ form }: { form: any }) => (
          <div>
            <Button type="primary" onClick={() => handleSubmit(form)}>
              {i18n.t('application:save')}
            </Button>
            <Button className="ml12" onClick={() => changeMode({ editFile: false, addFile: false })}>
              {i18n.t('application:cancel')}
            </Button>
          </div>
        ),
      },
    ];
    return fieldsList;
  };
  const [fileNameComp, fileExtension] = state.isAddMode
    ? [
        <Input
          name="name"
          placeholder={i18n.t('application:file name')}
          maxLength={255}
          onChange={(e) => {
            updater.fileName(e.target.value.trim());
          }}
        />,
        'xml',
      ]
    : [state.fileName, state.fileName.split('.').pop()];
  return (
    <FileContainer
      name={fileNameComp}
      ops={ops}
      isEditing={!state.isAddMode}
      className="repo-file-editor flex-1 v-flex"
    >
      <FileEditor
        name={state.fileName}
        fileExtension={fileExtension || 'xml'}
        value={state.value}
        autoHeight={autoHeight}
        minLines={8}
        maxLines={maxLines}
        onChange={onChange}
      />
      <RenderForm className="commit-file-form" list={getFieldsList()} />
    </FileContainer>
  );
};
export default RepoEditor;
