import { replaceEmoji, emojiMap } from '../utils/emoji';
import { describe, it } from '@jest/globals';


describe('emoji', () => {
  it('should Data normal', () => {
    expect(replaceEmoji('not')).toBe('not');
    expect(replaceEmoji(123)).toBe(123);
    expect(replaceEmoji(':sparkles:')).toBe(emojiMap[':sparkles:']);
  });
});
