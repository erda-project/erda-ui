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

// const path = require('path');
const plugin = require('tailwindcss/plugin');

module.exports = {
  important: true,
  darkMode: false, // or 'media' or 'class'
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '3px',
      },
      borderColor: (theme) => ({ ...theme('colors'), normal: '#00000019' }),
      //   backgroundImage: () => {
      //     const imgPath = path.resolve(__dirname, './app/images');
      //     return {
      //       'empty-holder': `url('${imgPath}/kztt.png')`,
      //       'empty-flow': `url('${imgPath}/kzt.png')`,
      //       'empty-ad-query': `url('${imgPath}/jzts.svg')`,
      //       'editor-background': `url('${imgPath}/editor-background.png')`,
      //       'new-point': `url('${imgPath}/zwt.png')`,
      //     };
      //   },
      colors: {
        primary: '#6a549e',
        normal: '#000000cc', // color-dark-8: rgba(0, 0, 0, .8)
        sub: '#00000099', // color-dark-6: rgba(0, 0, 0, .6)
        desc: '#0000007f', // color-dark-5: rgba(0, 0, 0, .5)
        light: '#00000066', // color-dark-4: rgba(0, 0, 0, .4)
        disabled: '#00000066', // color-dark-3: rgba(0, 0, 0, .3)
        gray: '#999999',
        grey: '#f5f5f5',
        red: '#ff4946',
        blue: '#0567ff',
        yellow: '#ffc11f',
        green: '#25ca64',
        orange: '#feab00',
        layout: '#f0eef5',
        white: '#ffffff',
        'light-primary': '#6a549e19', // rgba($primary, .1)
        'shallow-primary': '#6a549e99', // rgba($primary, .6)
        'light-gray': '#bbbbbb',
        'dark-8': '#000000cc',
        'dark-2': '#00000033',
        'dark-1': '#00000019',
        'dark-04': '#0000000a',
        'dark-02': '#00000005',
        'white-8': '#ffffffcc',
        'log-font': '#c2c1d0',
        'log-bg': '#3c444f',
      },
      flex: {
        '03': '0.3 1 0%',
      },
      fontFamily: {
        log: ['Menlo', 'PingFangSC-Regular', 'Consolas', 'Courier', 'monospace'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.nowrap': {
          overflow: 'hidden',
          'white-space': 'nowrap',
          'text-overflow': 'ellipsis',
        },
        '.not-allowed': {
          color: '#00000066',
          cursor: 'not-allowed',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    }),
  ],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./app/**/*.tsx', './app/**/*.jsx'],
  },
};
