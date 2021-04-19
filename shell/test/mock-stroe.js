import * as C from "../app/cube";

const mockStore = (path,state,effect ) => {
  jest.mock( "common/stores/user-map", () => {
    return C?.createStore( {
      name: "userMap",
      state: {
        1: {
          name: "name-dice",
          nick: "nick-dice"
        },
        2: {
          name: "name-dice"
        },
        3: {
          nick: "nick-dice"
        }
      },
      reducers: {
        setUserMap( state, userInfo ) {
          return { ...state, ...userInfo };
        }
      }
    } );
  } );
};

export default mockStore
