import { groupBy } from 'lodash';

export const convertDataForGantt = (
  data: { expandList: CP_GANTT.IData[]; updateList: CP_GANTT.IData[] },
  prevList: CP_GANTT.IGanttData[],
) => {
  let ganttData: CP_GANTT.IGanttData[] = [...prevList];

  const { expandList, updateList } = data;

  const prevDataGroup = { ...groupBy(prevList, 'pId'), ...expandList };

  const convert = (dataTemp: CP_GANTT.IData[], level = 0, pId?: string) => {
    dataTemp.forEach((item) => {
      const { key, title, start, end, isLeaf = true, hideChildren, ...rest } = item;
      const curData = {
        type: !isLeaf ? 'project' : 'task',
        id: key,
        name: title,
        start: new Date(start),
        end: new Date(end),
        progress: 0,
        isLeaf,
        hideChildren: hideChildren === undefined ? (!isLeaf ? !prevDataGroup[key]?.length : undefined) : hideChildren,
        level,
        pId: pId ?? 0,
        ...(pId ? { project: pId } : {}),
        ...rest,
      };
      ganttData.push(curData);
      if (prevDataGroup[curData.id]) {
        convert(prevDataGroup[curData.id], level + 1, curData.id);
      }
    });
  };

  if (expandList) {
    ganttData = [];
    convert(prevDataGroup['0']); // root: 0
  }
  if (updateList?.length) {
    updateList.forEach((item) => {
      let curData = ganttData.find((gItem) => gItem.id === item.key);
      if (curData) {
        const { key, title, start, end, isLeaf = true, ...rest } = item;
        curData = {
          ...curData,
          ...rest,
          isLeaf,
          id: key,
          name: title,
          start: new Date(start),
          end: new Date(end),
          type: !isLeaf ? 'project' : 'task',
        };
      }
    });
  }
  return ganttData;
};
