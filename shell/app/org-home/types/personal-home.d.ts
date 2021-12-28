declare namespace P_HOME {
  interface PersonActiveData {
    rank: number;
    id: string;
    name: string;
    value: number;
    avatar?: string;
  }

  interface PersonalContribute {
    events: number; // 协同数
    cases: number; // 自动化测试数
    commits: number; // 提交代码数
    executions: number; // 执行流水线数
  }
}
