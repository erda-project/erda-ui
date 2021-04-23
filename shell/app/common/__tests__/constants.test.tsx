import { FULL_DOC_DOMAIN, HELP_DOCUMENT, WORKSPACE_LIST } from '../constants';
import { describe, it } from '@jest/globals';

describe('emoji', () => {
  it('should Data normal', () => {
    expect(WORKSPACE_LIST.length).toBe(4);
    expect(HELP_DOCUMENT).toBe(`${FULL_DOC_DOMAIN}/mainVersion/manual/deploy/resource-management.html#%E7%AE%A1%E7%90%86%E9%85%8D%E9%A2%9D`);
  });
});
