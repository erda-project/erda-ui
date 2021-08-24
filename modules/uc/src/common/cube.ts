import cube from 'cube-state';
import { message } from 'src/common';
const { createStore, createFlatStore } = cube({
  singleton: true,
  extendEffect({ update, select }) {
    return {
      async call(fn: Function, payload: any = {}, config = {} as any) {
        const { successMsg } = config || {};
        let result = await fn(payload);

        if (successMsg) {
          message.success(successMsg);
        }

        return result;
      },
    };
  },
});

export { createStore, createFlatStore };
