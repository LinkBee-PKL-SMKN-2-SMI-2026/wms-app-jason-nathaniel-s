import { type Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}
