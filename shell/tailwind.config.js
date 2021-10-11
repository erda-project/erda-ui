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
        brightgray: '#eaeaea',
        darkgray: '#999999',
        grey: '#f5f5f5',
        layout: '#f0eef5',
        white: '#ffffff',
        lotion: '#fcfcfc',
        cultured: '#f6f4f9',
        magnolia: '#f2f1fc',
        mask: 'rgba(0,0,0,0.45)',
        'light-primary': '#6a549e19', // rgba($primary, .1)
        'shallow-primary': '#6a549e99', // rgba($primary, .6)
        'light-gray': '#bbbbbb',
        'dark-8': '#000000cc',
        'dark-6': '#00000066',
        'dark-2': '#00000033',
        'dark-1': '#00000019',
        'dark-04': '#0000000a',
        'dark-02': '#00000005',
        'white-8': '#ffffffcc',
        'log-font': '#c2c1d0',
        'log-bg': '#3c444f',
        'light-border': 'rgba(222,222,222,0.5)',
        'light-active': '#6a549e0f', // rgba($primary, .06)
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
      minHeight: {
        '1/4': '25%',
        '1/2': '50%',
        '3/5': '60%',
        '3/4': '75%',
      },
      maxHeight: {
        '1/4': '25%',
        '1/2': '50%',
        '3/5': '60%',
        '3/4': '75%',
      },
      width: {
        '1/10': '10%',
        '3/10': '30%',
        '7/10': '70%',
        '9/10': '90%',
      },
      transitionProperty: {
        height: 'height',
        width: 'width',
      },
    },
  },
  variants: {
    extend: {
      margin: ['first', 'last'],
      padding: ['first', 'last'],
    },
  },
  plugins: [
    plugin(({ addVariant, e }) => {
      addVariant('before', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`before${separator}${className}`)}::before`;
        });
      });
    }),
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
        '.border-all': {
          border: '1px solid #00000019',
        },
        '.border-top': {
          'border-top': '1px solid #00000019',
        },
        '.border-bottom': {
          'border-bottom': '1px solid #00000019',
        },
        '.border-left': {
          'border-left': '1px solid #00000019',
        },
        '.border-right': {
          'border-right': '1px solid #00000019',
        },
        '.border-dashed': {
          border: '1px dashed #00000019',
        },
      };
      const contentUtilities = {
        '.required': {
          content: 'attr(data-required)',
          color: '#f5222d',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
      addUtilities(contentUtilities, ['before']);
    }),
  ],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./app/**/*.tsx', './app/**/*.jsx'],
    options: {
      safelist: [/red/, /blue/, /yellow/, /green/, /orange/, /gray/, /cyan/, /grey/, /white/, /purple/, /flex-\d/],
    },
  },
};
