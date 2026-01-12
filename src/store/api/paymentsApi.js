import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL;

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
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
  // TEMPORARILY DISABLED: Disable caching by setting keepUnusedDataFor to 0
  keepUnusedDataFor: 0,
  tagTypes: ['Payment', 'Transaction'],
  endpoints: (builder) => ({
    // Get payments for vendor/outlet
    getVendorPayments: builder.query({
      query: ({ outletId, startDate, endDate, limit = 50 }) => {
        const params = new URLSearchParams();
        if (outletId) params.append('outletId', outletId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (limit) params.append('limit', limit);
        
        return {
          url: `/payment/vendor?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Payment'],
    }),
    
    // Get payment by ID
    getPayment: builder.query({
      query: (paymentId) => `/payment/${paymentId}`,
      providesTags: (result, error, paymentId) => [{ type: 'Payment', id: paymentId }],
    }),
    
    // Get user transactions
    getUserTransactions: builder.query({
      query: ({ userId, limit = 50 }) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        return `/payment/user/${userId}?${params.toString()}`;
      },
      providesTags: ['Transaction'],
    }),
    
    // Update payment status
    updatePaymentStatus: builder.mutation({
      query: ({ paymentId, status }) => ({
        url: `/payment/${paymentId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { paymentId }) => [
        { type: 'Payment', id: paymentId },
        'Payment',
      ],
    }),
  }),
});

export const {
  useGetVendorPaymentsQuery,
  useGetPaymentQuery,
  useGetUserTransactionsQuery,
  useUpdatePaymentStatusMutation,
} = paymentsApi;

