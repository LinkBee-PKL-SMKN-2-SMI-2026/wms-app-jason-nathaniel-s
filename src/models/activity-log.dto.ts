import { z } from 'zod';
import { GetActivityLogsSchema } from '../validations/activity-log.validation';

export type GetActivityLogsQuery = z.infer<typeof GetActivityLogsSchema>['query'];
