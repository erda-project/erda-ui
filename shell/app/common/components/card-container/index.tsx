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
import { Tooltip } from 'core/nusi';
import { Help as IconHelp } from '@icon-park/react';
import { EmptyHolder } from '../empty-holder';
import './index.scss';

export interface CardContainerProps {
  title: string | React.ElementType;
  tip?: string;
  operation?: React.ReactNode;
  holderWhen?: boolean;
  style?: React.CSSProperties;
  children: React.ReactChild | React.ReactChild[];
}

const CardContainer = ({ title, tip, operation, holderWhen, style, children }: CardContainerProps) => {
  return (
    <div className="ec-card-container flex flex-col" style={style}>
      {title || operation ? (
        <div className="h-8 flex items-center justify-between leading-8">
          {title ? (
            <div className="font-medium inline-flex items-center">
              {title}
              {tip ? (
                <Tooltip title={tip}>
                  <IconHelp className="text-base ml-1" />
                </Tooltip>
              ) : null}
            </div>
          ) : null}
          {operation ? <div>{operation}</div> : null}
        </div>
      ) : null}
      {holderWhen ? <EmptyHolder relative /> : children}
    </div>
  );
};

CardContainer.ChartContainer = ({ children, ...rest }: CardContainerProps) => {
  return (
    <CardContainer {...rest}>
      <div className="ec-chart-container">{children}</div>
    </CardContainer>
  );
};

export default CardContainer;
