import { isPromise, isImage, removeProtocol, ossImg, uuid, isValidJsonStr } from '../utils';
import { describe, it } from '@jest/globals';

describe('utils', () => {
  it('isImage ', () => {
    const suffixes = ['jpg', 'bmp', 'gif', 'png', 'jpeg', 'svg'];
    expect(isImage('images/a.doc')).toBe(false);
    suffixes.map(suffix => {
      expect(isImage(`images/a.${suffix}`)).toBe(true);
      expect(isImage(`images/a.${suffix.toUpperCase()}`)).toBe(true);
    });
  });
  it('isPromise', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise({ then: null })).toBe(false);
    expect(isPromise([])).toBe(false);
    expect(isPromise(null)).toBe(false);
  });
  it('removeProtocol', () => {
    expect(removeProtocol('http://www.erda.cloud')).toBe('//www.erda.cloud');
    expect(removeProtocol('www.erda.cloud')).toBe('www.erda.cloud');
  });
  it('ossImg', () => {
    expect(ossImg()).toBeUndefined();
    expect(ossImg(null)).toBeUndefined();
    expect(ossImg('http://oss.erda.cloud')).toBe('//oss.erda.cloud?x-oss-process=image/resize,w_200,h_200');
    expect(ossImg('http://oss.erda.cloud', {
      op: 'op',
      h: 100,
      w: 100,
    })).toBe('//oss.erda.cloud?x-oss-process=image/op,h_100,w_100');
  });
  it('isValidJsonStr', () => {
    expect(isValidJsonStr('')).toBe(true);
    expect(isValidJsonStr('erda')).toBe(false);
    expect(isValidJsonStr('{"name":"erda"}')).toBe(true);
  });
  it('uuid', () => {
    expect(uuid()).toHaveLength(20);
  });
});
