import type { RegisterData } from "../../interfaces/Profile";
import type { SessionUser } from "../../interfaces/SessionUser";

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  avatar_file?: File;
  avatar_url?: string | null;
}

export interface UserRepository {
  createUser(data: RegisterData): Promise<{ data?: SessionUser; error?: any }>;
  fetchRole(userId: string): Promise<{ data?: string | null, error?: any }>;
  fetchAdminUsersList(): Promise<{ data?: any[] | null, error?: any }>;
  getCurrentUser(): Promise<{ data?: any; error?: any }>;
  updateUser(updates: UpdateUserData): Promise<{ data?: SessionUser; error?: any }>;
  updateUserRole(userId: string, newRole: string): Promise<{ error?: any }>;
  deleteUser(userId: string): Promise<{ error?: any }>;
  login(email: string, password: string): Promise<{ data?: SessionUser; error?: any }>;
  logout(): Promise<{ error?: any }>;
  updatePassword(newPassword: string): Promise<{ error?: any }>;
  resetPasswordForEmail(email: string): Promise<{ error?: any; }>;
}
