import { apiCreator } from 'core/service';

export const getActiveRankList = apiCreator<() => P_HOME.PersonActiveData[]>({
  api: '/api/active-rank',
  mock: () => [
    {
      rank: 1,
      id: '1',
      name: '张三',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 666,
    },
    {
      rank: 2,
      id: '2',
      name: '张三',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 666,
    },
    {
      rank: 3,
      id: '3',
      name: '张三',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 666,
    },
    {
      rank: 4,
      id: '4',
      name: '张三奥术大师撒大所',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 666,
    },
    {
      rank: 5,
      id: '5',
      name: '2222222张三',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 666,
    },
    {
      rank: 6,
      id: '6',
      name: '张三',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 666,
    },
    {
      rank: 7,
      id: '7',
      name: '张三',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 666,
    },
    {
      rank: 8,
      id: '1000299',
      name: '陆秋燕',
      avatar: 'https://joeschmoe.io/api/v1/random',
      value: 3331,
    },
  ],
});

interface PersonalContributeResponse {
  data: P_HOME.PersonalContribute;
  indicators: {
    title: string[];
    max: number[];
    data: number[][];
  };
}

export const getPersonalContribute = apiCreator<() => PersonalContributeResponse>({
  api: '/api/personal-contribute',
  mock: () => {
    return {
      data: {
        events: 6661,
        cases: 6662,
        commits: 6663,
        executions: 6664,
      },
      indicators: {
        title: ['自动化测试', '代码', 'API', 'CI/CD', '协同'],
        max: [100, 100, 100, 100, 100],
        data: [
          [22, 100, 44, 55, 66],
          [55, 66, 77, 88, 99],
        ],
      },
    };
  },
});
