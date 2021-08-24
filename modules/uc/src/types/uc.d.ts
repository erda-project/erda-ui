declare namespace UC {
  interface ILoginPayload {
    identifier: string;
    password: string;
  }

  interface IRegistrationPayload {
    email: string;
    password: string;
    nick: string;
    // phone: string;
  }

  interface IUser {
    id: string;
    email: string;
    nick: string;
  }

  interface IErrorMsg {
    id: number;
    text: string;
  }
  interface IErrorRes {
    ui?: {
      messages?: IErrorMsg[];
      nodes?: Array<{
        attributes?: {
          name: string;
          type: string;
        };
        messages?: IErrorMsg[];
      }>;
    };
  }

  interface IUpdateUserPayload extends IRegistrationPayload {
    id: string;
  }
}
