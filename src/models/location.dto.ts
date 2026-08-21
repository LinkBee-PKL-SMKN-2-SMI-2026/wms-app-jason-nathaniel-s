import { z } from 'zod';
import {
  CreateLocationSchema,
  GetAllLocationSchema,
  GetLocationByIdSchema,
  UpdateLocationSchema,
  DeleteLocationSchema,
} from '../validations/location.validation';

export type CreateLocationRequest = z.infer<typeof CreateLocationSchema>['body'];
export type GetAllLocationQuery = z.infer<typeof GetAllLocationSchema>['query'];
export type GetLocationByIdParams = z.infer<typeof GetLocationByIdSchema>['params'];
export type UpdateLocationRequest = z.infer<typeof UpdateLocationSchema>['body'];
export type UpdateLocationParams = z.infer<typeof UpdateLocationSchema>['params'];
export type DeleteLocationParams = z.infer<typeof DeleteLocationSchema>['params'];
