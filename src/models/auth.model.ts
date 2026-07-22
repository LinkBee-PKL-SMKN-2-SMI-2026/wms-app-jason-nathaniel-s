import { type Request } from 'express';

// Definisikan isi data (payload) yang akan disimpan di dalam token
export interface TokenPayload {
  userId: string;
  email: string;
}

// Menambahkan properti 'user' ke dalam Request bawaan Express
export interface AuthRequest extends Request {
  user?: TokenPayload;
}
