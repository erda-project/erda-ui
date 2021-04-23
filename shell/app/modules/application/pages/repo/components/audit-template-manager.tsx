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
import { message } from 'app/nusi';
import { useUpdate } from 'common';
import repoStore from 'application/stores/repo';
import { getInfoFromRefName } from '../util';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';

// dice-config应用
export const ifRouterMatch = () => /\/workBench\/projects\/70\/apps\/4762\/repo\/tree\/.+\/audit\/template.json$/.test(window.location.pathname);

export const AuditTemplateManager = () => {
  const [{ isIframeInited, innerWindow }, updater] = useUpdate({
    isIframeInited: false,
    innerWindow: null,
  });
  const [tree, blob] = repoStore.useStore(s => [s.tree, s.blob]);
  const { commit, getRepoBlob } = repoStore.effects;
  const { changeMode } = repoStore.reducers;
  const { branch } = getInfoFromRefName(tree.refName);

  React.useEffect(() => {
    try {
      JSON.parse(blob.content ? blob.content : '{}');
    } catch (e) {
      message.error(i18n.t('application:jSON parsing error, please manually correct the template file'));
      changeMode({ editFile: true });
    }
    if (isIframeInited) {
      if (!innerWindow) {
        updater.innerWindow(window.frames[0].frames[0]);
      } else {
        innerWindow.postMessage(blob.content || '{}', '*');
      }
    }
  }, [blob, isIframeInited, innerWindow, updater, changeMode]);

  const MessageHandler = {
    inited: () => updater.isIframeInited(true),
  };

  useEffectOnce(() => {
    const msgHandler = (event: MessageEvent) => {
      if (event.origin === 'https://4u3oh.csb.app') {
        MessageHandler[event.data] ? MessageHandler[event.data]() : handleSubmit(event.data);
      }
    };
    window.addEventListener('message', msgHandler, false);
    return () => {
      window.removeEventListener('message', msgHandler);
    };
  });

  const handleSubmit = (content: string) => {
    const data = {
      actions: [
        {
          action: 'add',
          content,
          path: 'audit/template.json',
          pathType: 'blob',
        },
      ],
      branch,
      message: 'Update template.json',
    };
    commit(data).then((res) => {
      if (res.success) {
        message.success(i18n.t('application:update file successfully'));
        getRepoBlob();
      } else {
        message.error(i18n.t('application:failed to update file'));
      }
    });
    return content;
  };

  return (
    <iframe
      src="https://codesandbox.io/embed/staging-framework-4u3oh?fontsize=14&hidenavigation=1&theme=dark?view=preview?hidedevtools=1"
      style={{ width: '100%', height: '630px', border: '0', borderRadius: '4px', overflow: 'hidden' }}
      title="staging-framework-4u3oh"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  );
};
