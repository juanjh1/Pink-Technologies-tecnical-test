import * as z from "zod";
 
export const UserCreate = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  age: z.number().gt(17),
  password: z.string().min(6),
  role: z.string().min(2)
});
 
export const UserUpdate = UserCreate.partial()
