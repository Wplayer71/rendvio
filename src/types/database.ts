export interface Profile {
  id: string;
  email?: string;
  credit_balance: number;
  plan_tier: string;
  created_at: string;
  updated_at?: string;
}

export interface Render {
  id: string;
  user_id: string | null;
  mode: string;
  source_image_url: string;
  result_image_url: string | null;
  status: string;
  fal_request_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  payment_session_id: string | null;
  created_at: string;
}

export interface AnonymousTrial {
  id: string;
  identifier_hash: string;
  ip_address: string;
  created_at: string;
}
