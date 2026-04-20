export type Currency = 'XAF' | 'GHS' | 'USD'
export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'failed' | 'refunded'
export type DeliveryStatus = 'pending' | 'assigned' | 'delivered'
export type KeyStatus = 'available' | 'reserved' | 'sold'
export type MembershipStatus = 'active' | 'cancelled' | 'expired'
export type PaymentGateway = 'ebilling' | 'paystack'

export interface Service {
  id: string
  name: string
  icon_url: string | null
  color: string
  category: string | null
  description: string | null
  created_at: string
}

export interface PricingPlan {
  id: string
  service_id: string
  type: 'personal' | 'shared'
  label: string
  price: number
  duration_days: number
  created_at: string
}

export interface PlanPricing {
  id: string
  plan_id: string
  currency: Currency
  amount: number
  updated_at: string
}

export interface DigitalKey {
  id: string
  service_id: string
  plan_id: string | null
  key_value: string
  status: KeyStatus
  sold_at: string | null
  created_at: string
}

export interface GuestProfile {
  id: string
  email: string
  whatsapp: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  guest_profile_id: string | null
  status: OrderStatus
  currency: Currency
  total_amount: number
  payment_method: PaymentGateway | null
  payment_ref: string | null
  country_code: string | null
  cast_discount_applied: boolean
  discount_pct: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  plan_id: string | null
  slot_id: string | null
  digital_key_id: string | null
  unit_price: number
  currency: Currency
  delivery_status: DeliveryStatus
  delivered_at: string | null
  created_at: string
}

export interface CastMembership {
  id: string
  user_id: string
  status: MembershipStatus
  discount_pct: number
  started_at: string
  expires_at: string | null
  created_at: string
}

export interface PaymentTransaction {
  id: string
  order_id: string
  gateway: PaymentGateway
  gateway_ref: string | null
  amount: number
  currency: Currency
  status: 'initiated' | 'pending' | 'success' | 'failed'
  raw_response: Record<string, unknown> | null
  created_at: string
}

// Joined types for UI
export interface ServiceWithPlans extends Service {
  pricing_plans: (PricingPlan & { plan_pricing: PlanPricing[] })[]
}
