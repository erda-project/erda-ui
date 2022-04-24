import { TableRowSelection } from 'antd/lib/table/interface';

export interface ColumnsConfig {
  [key: string]: {
    dataIndex: string;
    hidden: boolean;
  };
}

export interface RowAction {
  title: React.ReactNode;
  onClick?: () => void;
  show?: boolean;
  disabled?: boolean;
  disabledTip?: string;
}

export interface TableRowActions<T> {
  width?: number | string;
  /**
   * (record: T) => IAction[]
   *
   * interface IAction {
   *   title: string;
   *   onClick: () => void;
   * }
   */
  render: (record: T) => RowAction[];
}

export type SortOrder = 'ascend' | 'descend';

export interface RowSelection<T extends Obj> extends TableRowSelection<T> {
  actions?: RowActions[];
}

export interface RowActions {
  key: string;
  name: string;
  disabled?: boolean;
  onClick: (selectedKeys: React.Key[]) => any;
  isVisible?: (selectedKeys: React.Key[]) => boolean;
}
