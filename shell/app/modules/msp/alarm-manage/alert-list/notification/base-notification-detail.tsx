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
import DiceConfigPage from 'config-page';
import AlarmDetailTitle from '../component/alarm-detail-title';
import { goTo } from 'common/utils';
import mspStore from 'msp/stores/micro-service';
import routeInfoStore from 'core/stores/route';

interface IProps {
  scope: 'micro_service' | 'org';
  scopeId: string | number;
  id: number;
}

const BaseNotificationDetail: React.FC<IProps> = ({ scope, scopeId, id }) => {
  const box = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const eventProxy = (e: MouseEvent) => {
      const { tagName } = e.target as Element;
      const wrapper = Array.from(document.querySelectorAll('.cp-markdown-preview'));
      const isMarkdown = wrapper.some((wrap) => wrap.contains(e.target));
      if (tagName.toUpperCase() === 'A' && isMarkdown) {
        e.preventDefault();
        let { href } = e.target as HTMLAnchorElement;
        const reg =
          /^\S+?\/workBench\/projects\/(?<projectId>\d+)\/apps\/(?<appId>\d+)\/deploy\/runtimes\/(?<runtimeId>\d+)\/overview$/;
        const match = href.match(reg);
        if (match && match.groups) {
          const { projectId, appId, runtimeId } = match.groups;
          href = goTo.resolve.projectDeployRuntime({
            projectId,
            appId,
            runtimeId,
            workspace: routeInfoStore.getState((s) => s.params.env).toLowerCase(),
          });
        }
        if (href) {
          goTo(href, { jumpOut: true });
        }
      }
    };
    box.current?.addEventListener('click', eventProxy);
    return () => {
      box.current?.removeEventListener('click', eventProxy);
    };
  }, []);

  return (
    <div ref={box}>
      <DiceConfigPage
        scenarioKey="msp-notify-detail"
        scenarioType="msp-notify-detail"
        inParams={{
          id,
          scope,
          scopeId,
        }}
        customProps={{
          ...['eventOverview', 'notificationContent'].reduce(
            (previousValue, currentValue) => ({
              ...previousValue,
              [currentValue]: {
                props: {
                  showDefaultBgColor: false,
                  className: 'bg-white',
                },
              },
            }),
            {},
          ),
        }}
        operationCallBack={(_, renderConfig) => {
          // @ts-ignore
          mspStore.reducers.updateAlarmTitle(renderConfig?.protocol?.state.pageTitle);
        }}
      />
    </div>
  );
};

export const PageTitle = () => {
  return (
    <AlarmDetailTitle
      onClick={() => {
        goTo('..');
      }}
    />
  );
};

export default BaseNotificationDetail;
