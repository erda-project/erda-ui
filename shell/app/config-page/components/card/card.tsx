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
import { ErdaIcon, Badge, TextBlockInfo, EmptyHolder as DefaultEmptyHolder } from 'common';
import { useDrag } from 'react-dnd';
import { Tooltip } from 'antd';
import { isBoolean } from 'lodash';
import classnames from 'classnames';
import { getImg } from 'app/config-page/img-map';
import './card.scss';

const noop = () => {};

interface CardItemProps {
  card: CP_CARD.ICard;
  cardType?: string;
  className?: string;
  defaultImg?: string;
  setIsDrag?: (bol: boolean) => void;
  CardRender?: React.FC<{ data: Obj }>;
  onClick?: (dataRef: Obj, action: string) => void;
  draggable?: boolean;
}

export const CardItem = (props: CardItemProps) => {
  const { card, cardType = 'cp-card', className = '', setIsDrag, CardRender, onClick, draggable, defaultImg } = props;

  const { id, imgURL, icon, title, star, starProps = {}, titleState, textMeta, iconOperations } = card || {};
  const [dragObj, drag] = useDrag({
    item: { type: cardType, data: card },
    canDrag: () => {
      return !!draggable;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  React.useEffect(() => {
    if (setIsDrag) {
      setIsDrag(dragObj.isDragging);
    }
  }, [dragObj.isDragging, setIsDrag]);

  const cls = classnames({
    'drag-wrap': true,
    dragging: dragObj && dragObj.isDragging,
    'cp-card-item': true,
    rounded: true,
  });

  const handleClick = (dataRef: Obj, action: string) => {
    onClick?.(dataRef, action);
  };

  return (
    <div className={`${className} ${cls}`} onClick={() => handleClick(card, 'card')}>
      <div className="info-card-content cursor-pointer px-4 py-3" key={id} ref={drag}>
        {CardRender ? (
          <CardRender data={card} />
        ) : (
          <>
            <div className={'flex justify-between items-start mb-3'}>
              <div className="flex flex-1 overflow-hidden">
                {imgURL || defaultImg ? (
                  <img src={imgURL ? getImg(imgURL) : defaultImg} className="head-icon mr-1" />
                ) : icon ? (
                  <ErdaIcon type={icon} size={28} className="head-icon mr-1" />
                ) : null}
                <div className="flex items-center overflow-hidden">
                  <div className="font-medium font-ms text-default truncate">{title}</div>
                </div>

                {titleState ? (
                  <div className="ml-1">
                    {titleState.map((item, idx) => (
                      <Badge
                        className={`${idx !== 0 ? 'ml-1' : ''}`}
                        showDot={false}
                        {...item}
                        key={item.text}
                        text={item.text}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="ml-2">
                {isBoolean(star) ? (
                  <Tooltip title={starProps?.tip}>
                    <ErdaIcon
                      {...starProps}
                      size={18}
                      fill={star ? 'yellow' : undefined}
                      type={star ? 'unstar' : 'star'}
                    />
                  </Tooltip>
                ) : null}
              </div>
            </div>
            {textMeta ? (
              <div className="mt-3 bg-default-01 flex justify-around p-2">
                {textMeta.map((item, idx) => {
                  return (
                    <TextBlockInfo
                      key={idx}
                      align="center"
                      size="small"
                      main={item.mainText}
                      sub={item.subText}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(item, 'textBlock');
                      }}
                    />
                  );
                })}
              </div>
            ) : null}
            {iconOperations ? (
              <div className="mt-3 flex">
                {iconOperations.map((item, idx) => {
                  return (
                    <Tooltip title={item.tip}>
                      <ErdaIcon
                        type={item.icon}
                        size={16}
                        onClick={() => handleClick(item, 'iconOperation')}
                        className={`text-default-4 hover:text-default-8 ${idx !== 0 ? 'ml-4' : ''}`}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export const Card = (props: CP_CARD.Props) => {
  const { props: configProps, execOperation = noop, customOp = {}, data } = props;
  const {
    cardType = 'cp-card',
    className = '',
    setIsDrag,
    direction = 'row',
    CardRender,
    EmptyHolder,
    defaultImg,
  } = configProps;

  const { cards, title, titleSummary } = data;

  const onClick = (dataRef: Obj, action: string) => {
    const { operations } = dataRef || {};
    switch (action) {
      case 'card':
        {
          const { star, ...restOp } = operations || {};
          Object.keys(restOp || {}).forEach((opKey) => {
            execOperation({ key: opKey, ...restOp[opKey], clientData: { dataRef } });
          });
        }
        break;
      default:
        Object.keys(operations || {}).forEach((opKey) => {
          execOperation({ key: opKey, ...operations[opKey], clientData: { dataRef } });
        });
        break;
    }
  };

  return (
    <div className={`cp-cards-container ${className}`}>
      {title ? (
        <div className="font-medium">
          <span>{title}</span>
          <span className="inline-block ml-1 bg-default-1 px-1.5 rounded-lg text-default-8 text-xs leading-5">
            {titleSummary}
          </span>
        </div>
      ) : null}
      <div className={`cp-cards flex ${direction} py-3 px-0.5 overflow-auto`}>
        {cards?.length
          ? cards.map((card) => {
              return (
                <CardItem
                  key={card.id}
                  card={{
                    ...card,
                    ...(isBoolean(card.star)
                      ? {
                          starProps: {
                            tip: card.operations?.star?.tip,
                            onClick: (e) => {
                              e.stopPropagation();
                              card.operations?.star &&
                                execOperation({ key: 'star', ...card.operations.star, clientData: { dataRef: card } });
                            },
                          },
                        }
                      : {}),
                  }}
                  defaultImg={defaultImg}
                  cardType={cardType}
                  setIsDrag={setIsDrag}
                  CardRender={CardRender}
                  onClick={onClick}
                />
              );
            })
          : EmptyHolder || <DefaultEmptyHolder relative />}
      </div>
    </div>
  );
};
