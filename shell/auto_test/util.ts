export const wait = (second: number) =>
  new Promise((re) => {
    setTimeout(re, second);
  });
