import { Locale } from '../locale-provider';

/* eslint-disable no-template-curly-in-string */
const localeValues: Locale = {
  locale: 'zh-cn',
  FormModal: {
    newForm: '新建${label}',
    editForm: '编辑${label}',
  },
  Table: {
    emptyText: '该页暂无数据，是否前往',
    firstPage: '第一页',
    ascend: '升序',
    descend: '降序',
    cancelSort: '取消排序',
    batchOperation: '批量操作',
    selectedItemsText: '已选择 ${size} 项',
    operation: '操作',
  },
  Pagination: {
    goToPage: '前往页',
    totalText: '共 ${total} 条',
    pageSizeText: '${size} 条 / 页',
  },
};

export default localeValues;
