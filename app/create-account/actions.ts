'use server';
import { z } from 'zod';

const checkUsername = (username: string) => !username.includes('potato');
const checkPassword = ({
    password,
    confirmPassword,
}: {
    password: string;
    confirmPassword: string;
}) => password === confirmPassword;
const passwordRegex = new RegExp(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/
);

const formSchema = z
    .object({
        username: z
            .string({
                invalid_type_error: 'Username must be a string',
                required_error: 'Username is required',
            })
            .min(3, 'Way too short!!')
            .trim()
            .transform((username) => `🔥${username}🔥`)
            .refine(checkUsername, 'custom error message'),
        email: z
            .string({
                invalid_type_error: 'Email must be a string',
                required_error: 'Email is required',
            })
            .trim()
            .toLowerCase()
            .email(
                'Invalid email address. Please enter a valid email address.'
            ),
        password: z
            .string()
            .min(5)
            .regex(
                passwordRegex,
                'A password must have lower case, UPPER CASE, number, and special character'
            ),
        confirmPassword: z.string().min(5),
    })
    .refine(checkPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export async function createAccount(prevState: any, formData: FormData) {
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password'),
    };
    const result = formSchema.safeParse(data);
    if (!result.success) {
        console.log(result.error.flatten());
        return result.error.flatten();
    } else {
        console.log(result.data);
    }
}
