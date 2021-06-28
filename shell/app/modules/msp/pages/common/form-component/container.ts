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

type Listener = () => any;

export default class Container<State = {}, Props = {}> {
  // props和state同react一样，由父类提供合理
  // readonly
  props: Readonly<Props>;

  state: Readonly<State>;

  _listeners: Listener[] = [];

  _forceUpdates: Listener[] = [];

  constructor(props: Props) {
    this.props = props;
  }

  setProps(props: any): void {
    this.props = props;
  }

  setState(updater: any, callback?: () => void): Promise<void> {
    return Promise.resolve().then(() => {
      let nextState;

      if (typeof updater === 'function') {
        nextState = updater(this.state);
      } else {
        nextState = updater;
      }

      if (nextState == null) {
        if (callback) callback();
        return;
      }

      this.state = { ...this.state, ...nextState };

      const promises = this._listeners.map((listener) => listener());

      return Promise.all(promises).then(() => {
        if (callback) {
          return callback();
        }
      });
    });
  }

  forceUpdate() {
    this._forceUpdates.forEach((listener) => listener());
  }

  subscribe(fn: Listener, fu: Listener) {
    this._listeners.push(fn);
    this._forceUpdates.push(fu);
  }

  unsubscribe(fn: Listener, fu: Listener) {
    this._listeners = this._listeners.filter((f) => f !== fn);
    this._forceUpdates = this._forceUpdates.filter((f) => f !== fu);
  }
}
