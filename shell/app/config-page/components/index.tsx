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

import { Table } from './table/table';
import { Filter as ContractiveFilter } from './contractive-filter/contractive-filter';
import { Form } from './form/form';
import { FormModal } from './form-modal/form-modal';
import { Container, RowContainer, LRContainer } from './container/container';
import { Card } from './card/card';
import { Button } from './button/button';
import { Drawer } from './drawer/drawer';
import { ActionForm } from './action-form';
import NotFound from './not-found';
import IssueKanban from './issue-kanban';
import { FileTree } from './file-tree/file-tree';
import { APIEditor } from './api-editor/api-editor';
import Radio from './radio/radio';
import SplitPage from './split-page/split-page';
import Tabs from './tabs/tabs';
import ApiResource from './api-resource/resource';
import Title from './title/title';
import { SortDragGroupList } from './sort-drag-group/sort-drag-group';
import Panel from './panel/panel';
import Popover from './popover/popover';
import EditList from './edit-list/edit-list';
import Breadcrumb from './breadcrumb/breadcrumb';
import SelectPro from './select-pro/select-pro';
import Input from './input/input';
import TreeSelect from './tree-select/tree-select';
import InfoPreview from './info-preview/info-preview';
import InputSelect from './input-select/input-select';
import Alert from './alert/alert';
import List from './list/list';
import Text from './text/text';
import Icon from './icon/icon';
import EmptyHolder from './empty-holder/empty-holder';
import Image from './image/image';
import DropdownSelect from './dropdown-select/dropdown-select';
import TableGroup from './table-group/table-group';
import TextGroup from './text-group/text-group';

export const containerMap = {
  Alert,
  Button,
  FormModal,
  Table,
  Card,
  Container,
  RowContainer,
  LRContainer,
  NotFound,
  Form,
  SplitPage,
  ActionForm,
  IssueKanban,
  ContractiveFilter,
  FileTree,
  Radio,
  Tabs,
  ApiResource,
  Title,
  Drawer,
  Panel,
  SortGroup: SortDragGroupList,
  Popover,
  APIEditor,
  EditList,
  Breadcrumb,
  SelectPro,
  Input,
  TreeSelect,
  InfoPreview,
  InputSelect,
  List,
  Text,
  Icon,
  EmptyHolder,
  Image,
  DropdownSelect,
  TableGroup,
  TextGroup,
};

