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

import { throttle } from 'lodash';
import { Button, Tooltip } from 'antd';
import React from 'react';
import LogContent from './log-content';
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import { firstCharToUpper } from 'app/common/utils';
import { useThrottleFn } from 'react-use';

import './log-roller.scss';

export interface IProps {
  content: string | object[];
  rolling: boolean;
  backwardLoading: boolean;
  hasLogs: boolean;
  searchOnce?: boolean;
  extraButton?: JSX.Element;
  CustomLogContent?: typeof React.Component;
  onStartRolling?: () => void;
  onGoToBottom?: () => void;
  onCancelRolling?: () => void;
  onGoToTop?: () => void;
  onShowDownloadModal: () => void;
  transformContent?: () => string;
  showStartButton?: boolean;
}

const LogRoller = React.forwardRef((props: IProps, ref) => {
  const prevDistanceToTop = React.useRef(0);
  const preElm = React.useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = React.useState(false);
  const { showStartButton = true } = props;

  React.useImperativeHandle(ref, () => ({
    preElm: preElm.current,
  }));

  const onScroll = () => {
    const { rolling, onCancelRolling, onGoToTop } = props;
    const distanceToBottom =
      (preElm.current?.scrollHeight ?? 0) - (preElm.current?.scrollTop ?? 0) - (preElm.current?.clientHeight ?? 0);
    const distanceToTop = preElm.current?.scrollTop ?? 0;

    const direction = distanceToTop > prevDistanceToTop.current ? 'down' : 'up';
    if (distanceToBottom > 10 && rolling) {
      onCancelRolling?.(); // 日志bottom !==0，取消自动rolling
    }
    // 向上移动顶部，并且移动前的距离不为 0 时，拉取日志
    if (direction === 'up' && preElm.current?.scrollTop === 0 && prevDistanceToTop.current !== 0) {
      onGoToTop?.(); // 往上移动
    }
    prevDistanceToTop.current = distanceToTop;
  };

  const toggleRolling = () => {
    const { rolling, onStartRolling, onCancelRolling } = props;
    if (rolling) {
      onCancelRolling?.();
    } else {
      onStartRolling?.();
    }
  };

  const changeSize = () => {
    setFullScreen(!fullScreen);
  };

  const throttleScroll = React.useCallback(
    throttle(() => onScroll(), 100),
    [],
  );

  const {
    content,
    rolling,
    hasLogs,
    onGoToTop,
    onGoToBottom,
    backwardLoading,
    CustomLogContent,
    extraButton,
    transformContent,
    searchOnce,
    onShowDownloadModal,
  } = props;

  let logContent = rolling ? (
    <div className="flex">
      Loading... <ErdaIcon className="ml-1" type="loading" spin />
    </div>
  ) : (
    <span>No Log Currently</span>
  );

  const ContentComp = CustomLogContent || LogContent;
  if (content && content.length) {
    logContent = (
      <div className="log-content-wrap" onScroll={throttleScroll}>
        {backwardLoading ? <ErdaIcon type="loading" spin className="log-state top" /> : null}
        <div ref={preElm} className="log-content">
          <ContentComp {...props} logs={content} transformContent={transformContent} />
        </div>
        {rolling ? <ErdaIcon type="loading" spin className="log-state bottom" /> : null}
      </div>
    );
  }

  return (
    <div className={`log-roller darken${fullScreen ? ' show-max' : ''}`}>
      {logContent}
      <div className={`log-control log-top-controls ${extraButton ? '' : 'no-switch'}`}>
        {extraButton || null}
        {hasLogs && (
          <Tooltip title={i18n.t('common:Download Log')}>
            <Button onClick={onShowDownloadModal} type="ghost">
              {i18n.t('common:Download Log')}
            </Button>
          </Tooltip>
        )}
        <Button onClick={changeSize} type="ghost">
          {fullScreen ? firstCharToUpper(i18n.t('default:exit full screen')) : i18n.t('default:Full screen')}
        </Button>
      </div>
      <div className="log-control btn-line-rtl">
        {onGoToBottom && (
          <Button onClick={() => onGoToBottom()} type="ghost">
            {i18n.t('Back to Bottom')}
          </Button>
        )}

        {onGoToTop && (
          <Button onClick={() => onGoToTop()} type="ghost">
            {i18n.t('Back to Top')}
          </Button>
        )}

        {!searchOnce && toggleRolling && showStartButton && (
          <Button onClick={toggleRolling} type="ghost">
            {rolling ? firstCharToUpper(i18n.t('default:pause')) : firstCharToUpper(i18n.t('default:start'))}
          </Button>
        )}
      </div>
    </div>
  );
});

export default LogRoller;
