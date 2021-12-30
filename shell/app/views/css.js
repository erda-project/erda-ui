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

module.exports = `
@font-face{font-family:"Roboto-Regular";src:url('/static/roboto-regular.ttf') format('opentype')}
body{margin:0;font-family:"Roboto-Regular";background-color:#f3f2f4;}
#erda-skeleton{position:fixed;top:0;left:0;z-index:999;display:flex;width:100%;height:100%;pointer-events:none}
.skeleton-nav{display:flex;align-items:center;justify-content:space-between;flex-direction:column;background-color:#fcfcfc;width:56px;height:100%;margin-right:16px}
.skeleton-sidebar-item{width:24px;height:24px;border-radius:100%;margin:10px auto;margin-bottom:20px}
.skeleton-sidebar-info{display:flex;margin:36px 0 0;padding:12px;background-color:rgba(48,38,71,0.03)}
.skeleton-body{position:relative;display:flex;flex:1;flex-direction:column;overflow:hidden}
.skeleton-logo{display:inline-block;width:36px;height:36px;border-radius:100%}
.skeleton-line{height:20px;margin-top:6px;margin-bottom:12px}
.skeleton-icon-line{height:24px;margin:20px 0 0 28px}
.skeleton-icon-line:before{position:relative;left:-28px;display:inline-block;width:24px;height:24px;margin-right:8px;background-color:#ddd;border-radius:100%;content:""}
.main-holder{display:flex;flex-direction:column;justify-content:center;align-items:center;height:80%;color:#bbbbbb;font-size:30px}
.main-holder span{margin-top:30px}
#enter-loading{position:relative;width:300px;height:4px;margin:46px auto 20px;overflow:hidden;background-color:#bbbbbb;border-radius:2px}
#enter-loading::before{position:absolute;display:block;width:100%;height:100%;background-color:#302647;border-radius:2px;transform:translateX(-300px);animation:a-lb 6s 0.2s linear forwards;content:""}
@keyframes a-lb{0%{transform:translateX(-300px)}
5%{transform:translateX(-240px)}
15%{transform:translateX(-30px)}
25%{transform:translateX(-30px)}
30%{transform:translateX(-20px)}
45%{transform:translateX(-20px)}
50%{transform:translateX(-15px)}
65%{transform:translateX(-15px)}
70%{transform:translateX(-10px)}
95%{transform:translateX(-10px)}
100%{transform:translateX(-5px)}
}@keyframes blink{0%{opacity:0.4}
50%{opacity:1}
100%{opacity:0.4}
}.blink{background:#ddd;animation-duration:2s;animation-name:blink;animation-iteration-count:infinite}
`;
