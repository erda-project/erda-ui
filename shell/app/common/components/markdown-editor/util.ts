// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

export enum CursorPosition {
  RIGHT = 'right',
  LEFT = 'left',
  START = 'start',
}

export const insertText = (obj: any, content: string, str: any[], cursorPosition?: CursorPosition) => {
  let value = '';
  if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
    const startPos = obj.selectionStart;
    const endPos = obj.selectionEnd;
    let cursorPos = startPos;
    const tmpStr = content;
    let subStr = '';
    if (startPos === endPos) {
      subStr = str.join('');
      value = tmpStr.substring(0, startPos) + subStr + tmpStr.substring(endPos, tmpStr.length);
      cursorPos += str[0].length;
    } else {
      subStr = str.join(tmpStr.substr(startPos, endPos));
      value = tmpStr.substring(0, startPos) + subStr + tmpStr.substring(endPos, tmpStr.length);
      cursorPos += str[0].length + subStr.length;
    }

    if (cursorPosition) {
      switch (cursorPosition) {
        case 'start':
          cursorPos = startPos;
          break;
        case 'left':
          cursorPos = 0;
          break;
        case 'right':
          cursorPos += str[0].length + str[1].length + subStr.length;
          break;
        default:
      }
    }

    // eslint-disable-next-line no-param-reassign
    obj.selectionStart = cursorPos;
    // eslint-disable-next-line no-param-reassign
    obj.selectionEnd = cursorPos;
  } else {
    value += str.join('');
  }
  obj.focus();
  return value;
};

export const moveEnd = (obj: any) => {
  const { selection }: any = document;
  obj.focus();
  const len = obj.value.length;
  if (selection) {
    const sel = obj.createTextRange();
    sel.moveStart('character', len);
    sel.collapse();
    sel.select();
  } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
    // eslint-disable-next-line no-param-reassign
    obj.selectionStart = len;
    // eslint-disable-next-line no-param-reassign
    obj.selectionEnd = len;
  }
};
