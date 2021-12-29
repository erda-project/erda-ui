declare namespace P_HOME {
  interface PersonActiveData {
    rank: number;
    id: string;
    name: string;
    value: number;
    avatar?: string;
  }

  interface PersonalContribute {
    events: number;
    cases: number;
    commits: number;
    executions: number;
  }
}
