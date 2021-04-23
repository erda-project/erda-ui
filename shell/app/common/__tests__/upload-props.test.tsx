import { getUploadProps } from '../utils/upload-props';
import { describe, it } from '@jest/globals';

describe('getUploadProps', () => {
  it('upload props ', () => {
    const result = getUploadProps({});
    expect(result.action).toBe('/api/files');
    expect(result.headers).toStrictEqual({ 'OPENAPI-CSRF-TOKEN': 'OPENAPI-CSRF-TOKEN' });
    expect(result.beforeUpload({ size: 20971550 })).toBe(false);
    expect(document.querySelectorAll('.ant-message-notice').length).toBeTruthy();
    expect(result.beforeUpload({ size: 10 })).toBe(true);
  });
});
