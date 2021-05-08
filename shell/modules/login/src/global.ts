const globalSpace = {

} as Record<string, any>

export const setGlobal = (k: string, v: any) => globalSpace[k] = v;
export const getGlobal = (k: any) => globalSpace[k];
