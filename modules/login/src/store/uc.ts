import { createFlatStore } from '~/common/cube';

interface State {
  profile?: UC.Profile;
}

const initState: State = {
  profile: undefined,
};

const ucStore = createFlatStore({
  name: 'uc',
  state: initState,
  effects: {
    async updateProfile({ call }, file) {
      // return call(uploadFile, file);
    },
  },
  reducers: {
    setProfile(state, data: UC.Profile) {
      console.log('data:', data);
      state.profile = data;
    },
  },
});

export default ucStore;
