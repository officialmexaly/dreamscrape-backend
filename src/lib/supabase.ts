import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Booking {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_date?: string;
  event_location?: string;
  event_types: string[];
  budget?: string;
  guests?: string;
  how_did_you_hear?: string;
  additional_details?: string;
  consultation_date: string;
  consultation_time: string;
  created_at?: string;
}
