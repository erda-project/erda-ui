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

declare namespace CP_TEXT {
  type IRenderType = 'linkText' | 'text' | 'statusText' | 'copyText' | 'textWithIcon';
  interface Spec {
    type: 'Text',
    props: IProps;
    operations?: Obj<CP_COMMON.Operation>
  }

  interface IProps {
    renderType: IRenderType;
    value: ILinkTextData | string | IStatusText | ICopyText;
    visible?: boolean;
    styleConfig?: IStyleConfig;
    textStyleName?: Obj;
  }

  interface IStatusTextItem {
    text: string;
    status: 'default' | 'success' | 'processing' | 'error';
  }
  type IStatusText = IStatusTextItem | IStatusTextItem[];

  interface ICopyText {
    text: string;
    copyText: string;
  }

  interface IStyleConfig {
    [pro: string]: any;
    bold?: boolean; // 是否加粗,
    lineHeight?: number;
    fontSize?: number;
  }

  interface ILinkTextData {
    text: Array<ILinkTarget | string> | ILinkTarget | string;
  }

  interface ILinkTarget {
    icon?: string;
    iconStyleName?: string;
    text: string;
    operationKey: string;
    styleConfig?: IStyleConfig;
  }

  type Props = MakeProps<Spec>;
}
