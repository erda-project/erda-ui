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

import { apiCreator } from 'core/service';

const apis = {
  getTicketList: {
    api: '/api/tickets',
  },
  addTicket: {
    api: 'post@/api/tickets',
  },
  closeTicket: {
    api: 'put@/api/tickets/:ticketId/actions/close',
  },
  reopenTicket: {
    api: 'put@/api/tickets/:ticketId/actions/reopen',
  },
  getTicketDetail: {
    api: '/api/tickets/:ticketId',
  },
  getTicketComments: {
    api: '/api/comments',
  },
  createTicketComments: {
    api: 'post@/api/comments',
  },
};

interface TicketListResp {
  tickets: PROBLEM.Ticket[];
  total: number;
}
export const getTicketList = apiCreator<(p: PROBLEM.ListQuery) => TicketListResp>(apis.getTicketList);
export const addTicket = apiCreator<(data: PROBLEM.CreateBody) => number>(apis.addTicket);
export const closeTicket = apiCreator<(query: { ticketId: number | string }) => void>(apis.closeTicket);
export const reopenTicket = apiCreator<(query: { ticketId: number | string }) => void>(apis.reopenTicket);
export const getTicketDetail = apiCreator<(query: { ticketId: number | string }) => PROBLEM.Ticket>(
  apis.getTicketDetail,
);
export const getTicketComments = apiCreator<
  (query: { ticketID: number }) => { comments: PROBLEM.Comment[]; total: number }
>(apis.getTicketComments);
export const createTicketComments = apiCreator<(data: PROBLEM.CommentBody) => void>(apis.createTicketComments);
