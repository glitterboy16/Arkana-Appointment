export interface Profile {
  id: string;
  username: string;
  avatar_url?: string | null;
  rol?: 'cliente' | 'empresa' | 'admin' | null;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  role: 'cliente' | 'empresa';
  avatar_file?: File;
  avatar_url?: string | null;
}
