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

import {
  Affix,
  Alert,
  Anchor,
  Avatar,
  Button,
  BackTop,
  Badge,
  Breadcrumb,
  Card,
  Carousel,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  ConfigProvider as AntdConfigProvider,
  Comment,
  Divider,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Menu,
  Modal,
  notification,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Radio,
  Rate,
  Row,
  Skeleton,
  Slider,
  Spin,
  Steps,
  Switch,
  Tabs,
  Tooltip,
  Transfer,
  Tree,
  TreeSelect,
  Timeline,
  TimePicker,
  Upload,
  version,
} from 'antd';
import { FixedSelect } from './fixed-select';
import FixRangePicker from './range-picker';
import Table from './wrapped-table';
import Tag from './wrapped-tag';
import FormBuilder from '../common/components/form-builder';
import { Filter } from '../common/components/filter';
import 'antd/dist/antd.less';

const locale = window.localStorage.getItem('locale');
const isZh = locale === 'zh';

Pagination.defaultProps = {
  showSizeChanger: false,
  ...Pagination.defaultProps,
  pageSize: 15,
  pageSizeOptions: ['15', '30', '45', '60'],
  showTotal: (total) => (isZh ? `共计 ${total} 条` : `total ${total} items`),
};

export {
  Affix,
  Anchor,
  // AutoComplete,
  Alert,
  Avatar,
  BackTop,
  Badge,
  Breadcrumb,
  Button,
  // Calendar,
  Card,
  Collapse,
  Carousel,
  Cascader,
  Checkbox,
  Col,
  Comment,
  DatePicker,
  Divider,
  Dropdown,
  Drawer,
  Ellipsis,
  Empty,
  Filter,
  Form,
  FormBuilder,
  Input,
  InputNumber,
  List,
  message,
  Menu,
  Modal,
  notification,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  FixRangePicker as RangePicker,
  Radio,
  Rate,
  Row,
  FixedSelect as Select,
  Skeleton,
  Slider,
  Spin,
  Steps,
  Switch,
  Table,
  Transfer,
  Tree,
  TreeSelect,
  Tabs,
  Tag,
  TimePicker,
  Timeline,
  Tooltip,
  // Mention,
  Upload,
  version,
  PageHeader,
  AntdConfigProvider,
};
