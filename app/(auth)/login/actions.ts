'use server';

import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_REGEX,
    PASSWORD_REGEX_ERROR,
} from '@/lib/constants';
import db from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { setSession } from '@/lib/session';
import { redirect } from 'next/navigation';

const checkEmailExists = async (email: string) => {
    const user = await db.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
    });

    return Boolean(user);
};

const formSchema = z.object({
    email: z
        .string()
        .email()
        .toLowerCase()
        .refine(checkEmailExists, "An account with this email doesn't exist"),
    password: z
        .string({
            required_error: 'Password is required',
        })
        .min(PASSWORD_MIN_LENGTH),
    // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function login(prevState: any, formData: FormData) {
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const result = await formSchema.safeParseAsync(data);
    if (!result.success) {
        return result.error.flatten();
    } else {
        const user = await db.user.findUnique({
            where: {
                email: result.data.email,
            },
            select: {
                id: true,
                password: true,
            },
        });

        const ok = await bcrypt.compare(
            result.data.password,
            user!.password ?? ''
        );

        if (ok) {
            await setSession(user!.id);
            redirect('/profile');
        } else {
            return {
                fieldErrors: {
                    password: ['Password is incorrect'],
                    email: [],
                },
            };
        }

        // if user is found, check the password hash
        // log the user in
        // redirect to "/profile"
    }
}
