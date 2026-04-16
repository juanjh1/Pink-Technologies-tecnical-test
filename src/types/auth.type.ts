import { z } from "zod";
import { LoginSchema } from "../schemas/auth.schema.js";

export type LoginType = z.infer<typeof LoginSchema>;
