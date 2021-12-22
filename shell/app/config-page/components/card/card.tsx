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
import { ErdaIcon, Badge, TextBlockInfo } from 'common';
import { useDrag } from 'react-dnd';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import './card.scss';

const fakeClick = 'fake-click';
const noop = () => {};

interface CardItemProps {
  card: CP_CARD.ICard;
  cardType?: string;
  className?: string;
  setIsDrag?: (bol: boolean) => void;
  CardRender?: React.FC<{ data: Obj }>;
  onClick?: (card: CP_CARD.ICard) => void;
  draggable?: boolean;
  onClickIconOperation?: (op: CP_CARD.IconOperation) => void;
}

export const CardItem = (props: CardItemProps) => {
  const {
    card,
    cardType = 'cp-card',
    className = '',
    setIsDrag,
    CardRender,
    onClick,
    draggable,
    onClickIconOperation,
  } = props;

  const { id, imgURL, icon, title, star, labels, textMeta, iconOperations } = card || {};
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

  return (
    <div className={`${className} ${cls}`} onClick={() => onClick?.(card)}>
      <div className="info-card-content cursor-pointer px-4 py-3" key={id} ref={drag}>
        {CardRender ? (
          <CardRender data={card} />
        ) : (
          <>
            <div className={'flex justify-between items-start mb-3'}>
              <div className="flex flex-1 overflow-hidden">
                {icon ? <ErdaIcon type={icon} size={28} className="head-icon mr-1" /> : null}
                {imgURL ? <img src={imgURL} className="head-icon mr-1" /> : null}
                <div className="flex items-center overflow-hidden">
                  <div className="font-medium font-ms text-default truncate">{title}</div>
                </div>
                {labels ? (
                  <div className="ml-1">
                    {labels.map((item, idx) => (
                      <Badge
                        className={`${idx !== 0 ? 'ml-1' : ''}`}
                        showDot={false}
                        key={item.label}
                        text={item.label}
                        {...item}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="ml-2">
                {star !== undefined ? <ErdaIcon size={18} type={star ? 'unstar' : 'star'} /> : null}
              </div>
            </div>
            {textMeta ? (
              <div className="mt-3 bg-default-01 flex justify-around p-2">
                {textMeta.map((item, idx) => {
                  return <TextBlockInfo key={idx} main={item.mainText} sub={item.subText} />;
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
  const { cardType = 'cp-card', className = '', setIsDrag, direction = 'row', CardRender } = configProps;

  const { cards, title, titleSummary } = data;

  const onClick = () => {};

  const onClickIconOperation = () => {};

  return (
    <div className="cp-cards-container">
      {title ? (
        <div className="font-medium">
          <span>{title}</span>
          <span className="ml-1 bg-default-1 px-2 rounded-lg">{titleSummary}</span>
        </div>
      ) : null}
      <div className={`cp-cards flex ${direction} py-3 px-0.5 overflow-auto`}>
        {cards?.map((card) => {
          return (
            <CardItem
              key={card.id}
              card={card}
              cardType={cardType}
              setIsDrag={setIsDrag}
              CardRender={CardRender}
              onClick={onClick}
              onClickIconOperation={onClickIconOperation}
            />
          );
        })}
      </div>
    </div>
  );
};
