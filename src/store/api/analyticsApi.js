import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL;

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    // Get orders by type
    getOrdersByType: builder.query({
      query: ({ outletId, restaurantId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (outletId) params.append('outletId', outletId);
        if (restaurantId) params.append('restaurantId', restaurantId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        return {
          url: `/analytics/orders-by-type?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Analytics'],
    }),
    
    // Get revenue by outlet
    getRevenueByOutlet: builder.query({
      query: ({ restaurantId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (restaurantId) params.append('restaurantId', restaurantId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        return {
          url: `/analytics/revenue-by-outlet?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Analytics'],
    }),
    
    // Get peak hours
    getPeakHours: builder.query({
      query: ({ outletId, restaurantId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (outletId) params.append('outletId', outletId);
        if (restaurantId) params.append('restaurantId', restaurantId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        return {
          url: `/analytics/peak-hours?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Analytics'],
    }),
    
    // Get dashboard summary
    getDashboardSummary: builder.query({
      query: ({ outletId, restaurantId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (outletId) params.append('outletId', outletId);
        if (restaurantId) params.append('restaurantId', restaurantId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        return {
          url: `/analytics/dashboard?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetOrdersByTypeQuery,
  useGetRevenueByOutletQuery,
  useGetPeakHoursQuery,
  useGetDashboardSummaryQuery,
} = analyticsApi;

