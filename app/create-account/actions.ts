'use server';
import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_REGEX,
    PASSWORD_REGEX_ERROR,
} from '@/lib/constants';
import db from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { setSession } from '@/lib/session';

const checkUsername = (username: string) => !username.includes('potato');
const checkPassword = ({
    password,
    confirmPassword,
}: {
    password: string;
    confirmPassword: string;
}) => password === confirmPassword;

const formSchema = z
    .object({
        username: z
            .string({
                invalid_type_error: 'Username must be a string',
                required_error: 'Username is required',
            })
            .trim()
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
        password: z.string().min(PASSWORD_MIN_LENGTH),
        // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
        confirmPassword: z.string().min(PASSWORD_MIN_LENGTH),
    })
    .superRefine(async ({ username }, ctx) => {
        const user = await db.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            ctx.addIssue({
                code: 'custom',
                message: 'This username is already taken',
                path: ['username'],
                fatal: true,
            });
            return z.NEVER;
        }
    })
    .superRefine(async ({ email }, ctx) => {
        const user = await db.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            ctx.addIssue({
                code: 'custom',
                message: 'This email is already taken',
                path: ['email'],
                fatal: true,
            });
            return z.NEVER;
        }
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
    const result = await formSchema.safeParseAsync(data);
    if (!result.success) {
        console.log(result.error.flatten());
        return result.error.flatten();
    } else {
        const hashedPassword = await bcrypt.hash(result.data.password, 12);
        const user = await db.user.create({
            data: {
                username: result.data.username,
                email: result.data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
            },
        });

        await setSession(user.id);

        redirect('/profile');
    }
}
