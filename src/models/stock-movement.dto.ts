import { z } from 'zod';
import {
  CreateInboundSchema,
  CreateOutboundSchema,
  GetMovementHistorySchema,
} from '../validations/stock-movement.validation';

export type CreateInboundRequest = z.infer<typeof CreateInboundSchema>['body'];
export type CreateOutboundRequest = z.infer<typeof CreateOutboundSchema>['body'];
export type GetMovementHistoryQuery = z.infer<typeof GetMovementHistorySchema>['query'];
