import { UserCreate } from '../schemas/user.schema.js';
import { UserUpdate } from '../schemas/user.schema.js';
import { z } from 'zod';

export type UserCreateType = z.infer<typeof UserCreate>
export type UserUpdateType = z.infer<typeof UserUpdate>
