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
    setIsDrag?: (b: boolean) => void;
    CardRender?: React.FC<{ data: Obj }>;
  }

  interface ICard {
    id: string;
    icon?: string;
    imgURL?: string;
    title?: string;
    star?: boolean;
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
