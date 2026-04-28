import type { RutaBackend } from './tipos';
import { rutasAuth } from './auth';
import { rutasCitas } from './citas';
import { rutasNegocios } from './negocios';

export const rutasBackend: RutaBackend[] = [
  ...rutasAuth,
  ...rutasNegocios,
  ...rutasCitas,
];
