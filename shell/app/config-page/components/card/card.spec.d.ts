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

declare namespace CP_CARD {
  interface Spec {
    type: 'Card';
    props: IProps;
    data: ICardData;
  }

  interface ICardData {
    title?: string;
    titleSummary?: string;
    cards?: ICard[];
  }

  interface IProps {
    cardType?: string;
    direction?: 'row' | 'col';
    className?: string;
    itemClassName?: string;
    setIsDrag?: (b: boolean) => void;
    defaultImg?: string;
    CardRender?: React.FC<{ data: Obj }>;
    EmptyHolder?: React.FC;
  }

  interface ICard {
    id: string;
    icon?: string | React.ReactElement;
    imgURL?: string;
    title?: string;
    star?: boolean;
    starProps?: Obj;
    buttonOperation?: { type: string; text: string } | React.ReactElement;
    titleState?: Array<{ status: string; text: string }>;
    textMeta?: Array<{ mainText: string; subText: string }>;
    operations?: Obj<CP_COMMON.Operation>;
    extraInfo?: React.ReactNode;
    iconOperations: IconOperation[];
  }

  interface IconOperation {
    icon: string;
    tip?: string;
    operations: {
      clickGoto?: CP_COMMON.Operation;
      click?: CP_COMMON.Operation;
    };
  }

  type Props = MakeProps<Spec>;
}
