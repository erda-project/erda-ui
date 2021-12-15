const mockData: CP_KANBAN.Spec = {
  type: 'Kanban',
  props: {},
  data: {
    operations: {
      boardCreate: {},
    },
    boards: [
      {
        id: '1',
        pageNo: 1,
        total: 2,
        pageSize: 20,
        title: '已完成',
        operations: {
          boardDelete: {},
          boardUpdate: {},
          boardLoadMore: {},
        },
        cards: [
          {
            id: '1-1',
            title:
              'ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1ttt1ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1,ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1',
            extra: {
              priority: 'HIGH',
              type: 'TASK',
            },
            operations: {
              cardMoveTo: {
                async: true,
                serverData: {
                  extra: {
                    allowedMoveToTargetBoardIDs: ['2', '3'],
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
};

export default mockData;
