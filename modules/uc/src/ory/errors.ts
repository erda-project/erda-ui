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

import { message } from 'src/common';
import { history } from 'src/common';
export function handleFlowError<S>(
  flowType: 'login' | 'registration' | 'settings' | 'recovery' | 'verification',
  resetFlow: React.Dispatch<React.SetStateAction<S | undefined>>,
) {
  return async (err: AxiosError) => {
    switch (err.response?.data.error?.id) {
      case 'session_aal2_required':
        // 2FA is enabled and enforced, but user did not perform 2fa yet!
        window.location.href = err.response?.data.redirect_browser_to;
        return;
      case 'session_already_available':
        // User is already signed in, let's redirect them home!
        // await history.push('/');
        return;
      case 'session_refresh_required':
        // We need to re-authenticate to perform this action
        // window.location.href = err.response?.data.redirect_browser_to;
        return;
      case 'self_service_flow_return_to_forbidden':
        // The flow expired, let's request a new one.
        message.error('The return_to address is not allowed.');
        resetFlow(undefined);
        // await history.push('/' + flowType);
        return;
      case 'self_service_flow_expired':
        // The flow expired, let's request a new one.
        message.error('Your interaction expired, please fill out the form again.');
        resetFlow(undefined);
        // await history.push('/' + flowType);
        return;
      case 'security_csrf_violation':
        // A CSRF violation occurred. Best to just refresh the flow!
        message.error('A security violation was detected, please fill out the form again.');
        resetFlow(undefined);
        await history.push('/' + flowType);
        return;
      case 'security_identity_mismatch':
        // The requested item was intended for someone else. Let's request a new flow...
        resetFlow(undefined);
        await history.push('/' + flowType);
        return;
      case 'browser_location_change_required':
        // Ory Kratos asked us to point the user to this URL.
        window.location.href = err.response.data.redirect_browser_to;
        return;
    }

    switch (err.response?.status) {
      case 410:
        // The flow expired, let's request a new one.
        resetFlow(undefined);
        await history.push('/' + flowType);
        return;
    }

    // We are not able to handle the error? Return it.
    return Promise.reject(err);
  };
}
