import { z } from 'zod';

const PostUserFormSchema = z.object({
  name: z.string().nonempty({ message: 'Ingresa un nombre' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  // .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  // .regex(/[0-9]/, { message: "Password must contain at least one number" })
  // .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
});

export type PostUserFormData = z.infer<typeof PostUserFormSchema>;
