export const convertDataForGantt = (data: CP_GANTT.IData[]) => {
  const ganttData: CP_GANTT.IGanttData[] = [];

  const convert = (dataTemp: CP_GANTT.IData[], level = 0, pId?: string) => {
    dataTemp.forEach((item) => {
      const { id, name, start, end, children, hideChildren, ...rest } = item;
      ganttData.push({
        type: children?.length ? 'project' : 'task',
        id,
        name,
        start: new Date(start),
        end: new Date(end),
        progress: 0,
        isParent: !!children?.length,
        hideChildren: hideChildren === undefined ? false : hideChildren,
        ...(pId ? { project: pId } : {}),
        dataTemp: rest,
        level,
      });
      if (children?.length) {
        convert(children, level + 1, id);
      }
    });
  };

  convert(data);

  return ganttData;
};
