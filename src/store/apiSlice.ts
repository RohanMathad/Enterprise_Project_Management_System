import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DashboardMetrics, Task, ChatMessage, ChatChannel } from '../types/global.types';
import { RootState } from './store';

// TODO: Update baseUrl when real API is integrated
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // TODO: Uncomment and modify these when real backend endpoints are attached
    getDashboardMetrics: builder.query<DashboardMetrics, void>({
      query: () => '/dashboard/metrics',
    }),
    getTasks: builder.query<Task[], void>({
      query: () => '/tasks',
    }),
    getMessages: builder.query<ChatMessage[], string>({
      query: (channelId) => `/chat/channels/${channelId}/messages`,
    }),
    getChannels: builder.query<ChatChannel[], void>({
      query: () => '/chat/channels',
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetTasksQuery,
  useGetMessagesQuery,
  useGetChannelsQuery,
} = apiSlice;
