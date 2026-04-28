import type { User } from '@supabase/supabase-js';
import type { Profile } from './Profile';

export interface SessionUser {
  user: User;
  profile: Profile;
}
