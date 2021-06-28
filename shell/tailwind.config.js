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
      colors: {
        primary: '#6a549e',
        normal: '#000000cc', // color-dark-8: rgba(0, 0, 0, .8)
        sub: '#00000099', // color-dark-6: rgba(0, 0, 0, .6)
        // desc: '#0000007f', // color-dark-5: rgba(0, 0, 0, .5)
        desc: '#00000066', // color-dark-4: rgba(0, 0, 0, .4)
        icon: '#00000066', // color-dark-3: rgba(0, 0, 0, .3)
        disabled: '#00000066', // color-dark-3: rgba(0, 0, 0, .3)
        holder: '#00000033', // color-dark-3: rgba(0, 0, 0, .2)
        red: '#df3409',
        danger: '#df3409',
        blue: '#0567ff',
        info: '#0567ff',
        yellow: '#feab00',
        warning: '#feab00',
        green: '#34b37e',
        success: '#34b37e',
        orange: '#f47201',
        purple: '#6a549e',
        cyan: '#5bd6d0ff',
        gray: '#666666',
        grey: '#f5f5f5',
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
        2: '2 2 0%',
        3: '3 3 0%',
        4: '4 4 0%',
        5: '5 5 0%',
        6: '6 6 0%',
        7: '7 7 0%',
        8: '8 8 0%',
      },
      fontFamily: {
        log: ['Menlo', 'PingFangSC-Regular', 'Consolas', 'Courier', 'monospace'],
      },
      cursor: {
        copy: 'copy',
      },
      opacity: {
        6: '0.06',
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
