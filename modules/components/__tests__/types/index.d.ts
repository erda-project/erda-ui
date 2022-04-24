/* eslint-disable @typescript-eslint/method-signature-style */
export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      isExist(selector: string, expect: number): R;
      isExistClass(selector: string, expect: string): R;
      toHaveBeenLastCalledWithNth(nthParams: number, expectParams: Obj): R;
    }
  }
}
