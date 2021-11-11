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
import Markdown from 'common/utils/marked';
import MdEditor, { Plugins } from '@erda-ui/react-markdown-editor-lite';
import { itemInfo } from '@erda-ui/react-markdown-editor-lite/share/var';
import { EditorProps } from '@erda-ui/react-markdown-editor-lite/editor';
import UploadPlugin from './upload-plugin';
import { uploadFile } from '../../services';
import { convertToFormData } from 'common/utils';
import { getFormatter } from 'charts/utils';
import '@erda-ui/react-markdown-editor-lite/lib/index.css';
import './editor.scss';

MdEditor.use(UploadPlugin);

interface IProps extends Omit<EditorProps, 'renderHTML'> {
  autoSize: boolean;
  defaultHight: number;
  maxHeight: number;
}

const Editor = React.forwardRef((props: IProps, ref) => {
  const { autoSize, defaultHight, maxHeight, style, ...restEditorProps } = props;

  React.useEffect(() => {
    if (autoSize && defaultHight && maxHeight) {
      MdEditor.use(Plugins.AutoResize, {
        min: defaultHight, // min height
        max: maxHeight, // max height
      });
    }
  }, [autoSize, defaultHight, maxHeight]);

  function onImageUpload(file: File, imageText: string, itemsInfo: itemInfo[]) {
    // Chrome会把文件名作为第一个复制内容，而把第二个复制的文件的名称统一改为image.png
    const text = itemsInfo.find((i) => i.kind === 'string');
    const fileName = text ? text.content : file.name;
    let newFile = file;
    if (text) {
      newFile = new window.File([file], fileName, { type: file.type });
    }
    return new Promise((resolve) => {
      (uploadFile(convertToFormData({ file: newFile })) as unknown as Promise<{ data: { size: number; url: string } }>) // TODO ts type
        .then((res) => {
          const { size, url } = res?.data || {};
          let imageUrl = imageText;
          imageUrl = imageText
            .replace('{url}', url)
            .replace(/\[(.+)\]/, `[${fileName}(${getFormatter('STORAGE', 'B').format(size)})]`);
          resolve(imageUrl);
        });
    }) as Promise<string>;
  }

  return (
    <MdEditor
      ref={ref}
      style={autoSize ? { ...style } : { height: `${defaultHight}px`, ...style }}
      {...restEditorProps}
      htmlClass="ec-md-content"
      renderHTML={(text: string) => Markdown(text)}
      onImageUpload={onImageUpload}
    />
  );
});

export default Editor;
