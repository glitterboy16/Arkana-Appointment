import type { RegisterData } from "../../interfaces/Profile";
import type { SessionUser } from "../../interfaces/SessionUser";
import type { UpdateUserData, UserRepository } from "../repositories/UserRepository";
import { SupabaseStorageRepository } from "./SupabaseStorageRepository";

export class SupabaseUserRepository implements UserRepository {
  storageRepository = new SupabaseStorageRepository();

  async createUser(_data: RegisterData): Promise<{ data?: SessionUser; error?: any }> {
    return { error: { message: 'Supabase no configurado' } };
  }

  async login(_email: string, _password: string): Promise<{ data?: SessionUser; error?: any }> {
    return { error: { message: 'Supabase no configurado' } };
  }

  async logout(): Promise<{ error?: any }> {
    return { error: null };
  }

  async getCurrentUser() {
    return { data: null, error: { message: 'Supabase no configurado' } };
  }

  async fetchRole(_userId: string): Promise<{ data?: string | null; error?: any }> {
    return { data: null, error: null };
  }

  async updateUser(_updates: UpdateUserData): Promise<{ data?: SessionUser; error?: any }> {
    return { error: { message: 'Supabase no configurado' } };
  }

  async updateUserRole(_userId: string, _newRole: string): Promise<{ error?: any }> {
    return { error: { message: 'Supabase no configurado' } };
  }

  async fetchAdminUsersList(): Promise<{ data?: any[] | null; error?: any }> {
    return { data: null, error: null };
  }

  async deleteUser(_userId: string): Promise<{ error?: any }> {
    return { error: { message: 'Supabase no configurado' } };
  }

  async resetPasswordForEmail(_email: string): Promise<{ error?: any }> {
    return { error: { message: 'Supabase no configurado' } };
  }

  async updatePassword(_newPassword: string): Promise<{ error?: any }> {
    return { error: { message: 'Supabase no configurado' } };
  }
}
