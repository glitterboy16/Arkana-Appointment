import { SupabaseStorageRepository } from '../supabase/SupabaseStorageRepository';
import { SupabaseUserRepository } from '../supabase/SupabaseUserRepository';
import type { StorageRepository } from './StorageRepository';
import type { UserRepository } from './UserRepository';

/**
 * Fábrica de repositorios.
 *
 * Cada función devuelve una instancia del repositorio concreto que usará la app
 * para acceder a sus tablas. Centralizar la creación aquí permite cambiar de
 * proveedor (Supabase → otra API) sin tocar el resto del código.
 */

export const createUserRepository = (): UserRepository => {
  return new SupabaseUserRepository();
};

export const createStorageRepository = (): StorageRepository => {
  return new SupabaseStorageRepository();
};
