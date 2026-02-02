import { apiClient, ApiResponse } from '../client'

// Payment Gateway Types
export interface PaymentGateway {
  id: number
  name: string
  display_name: string
  is_active: boolean
  is_test_mode: boolean
  description?: string
  is_ready: boolean
  created_at: string
  updated_at: string
}

export interface CreatePaymentGatewayRequest {
  name: string
  display_name: string
  is_active: boolean
  is_test_mode: boolean
  credentials: Record<string, any>
  settings?: Record<string, any>
  description?: string
}

export interface UpdatePaymentGatewayRequest {
  display_name?: string
  is_active?: boolean
  is_test_mode?: boolean
  credentials?: Record<string, any>
  settings?: Record<string, any>
  description?: string
}

export interface PaymentGatewayListParams {
  is_active?: boolean
  name?: string
  per_page?: number
  page?: number
}

// Invoice Types
export interface Invoice {
  id: number
  invoice_number: string
  user_id: number
  type: string
  subtotal: number
  tax: number
  discount: number
  total: number
  currency: string
  status: string
  due_date?: string
  paid_at?: string
  notes?: string
  metadata?: Record<string, any>
  is_paid: boolean
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface CreateInvoiceRequest {
  user_id: number
  type: string
  subtotal: number
  tax?: number
  discount?: number
  currency?: string
  due_date?: string
  notes?: string
  metadata?: Record<string, any>
  invoiceable_type?: string
  invoiceable_id?: number
}

export interface UpdateInvoiceRequest {
  subtotal?: number
  tax?: number
  discount?: number
  status?: string
  due_date?: string
  notes?: string
  metadata?: Record<string, any>
}

export interface InvoiceListParams {
  status?: string
  type?: string
  user_id?: number
  search?: string
  per_page?: number
  page?: number
}

// Payment Types
export interface Payment {
  id: number
  invoice_id: number
  payment_gateway_id: number
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  gateway_response?: Record<string, any>
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface CreatePaymentRequest {
  invoice_id: number
  payment_gateway_id: number
  amount: number
  currency?: string
}

export interface PaymentListParams {
  status?: string
  user_id?: number
  invoice_id?: number
  payment_gateway_id?: number
  per_page?: number
  page?: number
}

// Subscription Types
export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  payment_gateway_id: number
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing'
  current_period_start: string
  current_period_end: string
  trial_ends_at?: string
  canceled_at?: string
  ends_at?: string
  gateway_subscription_id?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionRequest {
  user_id: number
  plan_id: number
  payment_gateway_id: number
  trial_days?: number
}

export interface SubscriptionListParams {
  status?: string
  user_id?: number
  plan_id?: number
  per_page?: number
  page?: number
}

// Refund Types
export interface Refund {
  id: number
  payment_id: number
  amount: number
  reason?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  gateway_refund_id?: string
  refunded_at?: string
  created_at: string
  updated_at: string
}

export interface CreateRefundRequest {
  payment_id: number
  amount: number
  reason?: string
}

export interface RefundListParams {
  status?: string
  payment_id?: number
  per_page?: number
  page?: number
}

export const paymentGatewayService = {
  // Payment Gateways
  async getGateways(params?: PaymentGatewayListParams): Promise<ApiResponse<PaymentGateway[]>> {
    return apiClient.get('/v1/admin/payment-gateways', { params })
  },

  async getGateway(id: number): Promise<ApiResponse<PaymentGateway>> {
    return apiClient.get(`/v1/admin/payment-gateways/${id}`)
  },

  async createGateway(data: CreatePaymentGatewayRequest): Promise<ApiResponse<PaymentGateway>> {
    return apiClient.post('/v1/admin/payment-gateways', data, { skipToast: true })
  },

  async updateGateway(id: number, data: UpdatePaymentGatewayRequest): Promise<ApiResponse<PaymentGateway>> {
    return apiClient.put(`/v1/admin/payment-gateways/${id}`, data, { skipToast: true })
  },

  async deleteGateway(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/v1/admin/payment-gateways/${id}`, { skipToast: true })
  },

  // Invoices
  async getInvoices(params?: InvoiceListParams): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get('/v1/admin/invoices', { params })
  },

  async getInvoice(id: number): Promise<ApiResponse<Invoice>> {
    return apiClient.get(`/v1/admin/invoices/${id}`)
  },

  async createInvoice(data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return apiClient.post('/v1/admin/invoices', data, { skipToast: true })
  },

  async updateInvoice(id: number, data: UpdateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return apiClient.put(`/v1/admin/invoices/${id}`, data, { skipToast: true })
  },

  async deleteInvoice(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/v1/admin/invoices/${id}`, { skipToast: true })
  },

  // Payments (Admin)
  async getPayments(params?: PaymentListParams): Promise<ApiResponse<Payment[]>> {
    return apiClient.get('/v1/admin/payments', { params })
  },

  async getPayment(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.get(`/v1/admin/payments/${id}`)
  },

  // Subscriptions (Admin)
  async getSubscriptions(params?: SubscriptionListParams): Promise<ApiResponse<Subscription[]>> {
    return apiClient.get('/v1/admin/subscriptions', { params })
  },

  async getSubscription(id: number): Promise<ApiResponse<Subscription>> {
    return apiClient.get(`/v1/admin/subscriptions/${id}`)
  },

  // Refunds (Admin)
  async getRefunds(params?: RefundListParams): Promise<ApiResponse<Refund[]>> {
    return apiClient.get('/v1/admin/refunds', { params })
  },

  async getRefund(id: number): Promise<ApiResponse<Refund>> {
    return apiClient.get(`/v1/admin/refunds/${id}`)
  },

  async createRefund(data: CreateRefundRequest): Promise<ApiResponse<Refund>> {
    return apiClient.post('/v1/admin/refunds', data, { skipToast: true })
  },

  // Customer Invoices
  async getCustomerInvoices(params?: InvoiceListParams): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get('/v1/customer/invoices', { params })
  },

  async getCustomerInvoice(id: number): Promise<ApiResponse<Invoice>> {
    return apiClient.get(`/v1/customer/invoices/${id}`)
  },

  // Customer Payments
  async getCustomerPayments(params?: PaymentListParams): Promise<ApiResponse<Payment[]>> {
    return apiClient.get('/v1/customer/payments', { params })
  },

  async getCustomerPayment(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.get(`/v1/customer/payments/${id}`)
  },

  async createCustomerPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return apiClient.post('/v1/customer/payments', data, { skipToast: true })
  },

  async updateCustomerPayment(id: number, data: Partial<CreatePaymentRequest>): Promise<ApiResponse<Payment>> {
    return apiClient.put(`/v1/customer/payments/${id}`, data, { skipToast: true })
  },

  async deleteCustomerPayment(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/v1/customer/payments/${id}`, { skipToast: true })
  },

  async executePaypalPayment(paymentId: number, data: { paypal_order_id: string }): Promise<ApiResponse<Payment>> {
    return apiClient.post(`/v1/customer/payments/${paymentId}/execute-paypal`, data, { skipToast: true })
  },

  // Customer Subscriptions
  async getCustomerSubscriptions(params?: SubscriptionListParams): Promise<ApiResponse<Subscription[]>> {
    return apiClient.get('/v1/customer/subscriptions', { params })
  },

  async getCustomerSubscription(id: number): Promise<ApiResponse<Subscription>> {
    return apiClient.get(`/v1/customer/subscriptions/${id}`)
  },

  async createCustomerSubscription(data: CreateSubscriptionRequest): Promise<ApiResponse<Subscription>> {
    return apiClient.post('/v1/customer/subscriptions', data, { skipToast: true })
  },

  async updateCustomerSubscription(id: number, data: Partial<CreateSubscriptionRequest>): Promise<ApiResponse<Subscription>> {
    return apiClient.put(`/v1/customer/subscriptions/${id}`, data, { skipToast: true })
  },

  async cancelCustomerSubscription(id: number): Promise<ApiResponse<Subscription>> {
    return apiClient.delete(`/v1/customer/subscriptions/${id}`, { skipToast: true })
  },

  // Customer Refunds
  async getCustomerRefunds(params?: RefundListParams): Promise<ApiResponse<Refund[]>> {
    return apiClient.get('/v1/customer/refunds', { params })
  },

  async getCustomerRefund(id: number): Promise<ApiResponse<Refund>> {
    return apiClient.get(`/v1/customer/refunds/${id}`)
  },
}
