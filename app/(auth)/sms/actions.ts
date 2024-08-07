'use server';

import twilio from 'twilio';
import { z } from 'zod';
import validator from 'validator';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import crypto from 'crypto';
import { setSession } from '@/lib/session';

interface ActionState {
    token: boolean;
}

interface State {
    handle(formData: FormData): Promise<{
        token: boolean;
        error?: z.typeToFlattenedError<string, string>;
    }>;
}

class NoTokenState implements State {
    private phoneSchema = z
        .string()
        .trim()
        .refine(
            (phone) => validator.isMobilePhone(phone, 'ko-KR'),
            'Wrong phone format!'
        );

    private async getToken(): Promise<string> {
        const token = crypto.randomInt(100000, 999999).toString();
        const exists = await db.sMSToken.findUnique({
            where: {
                token,
            },
            select: {
                id: true,
            },
        });
        if (exists) {
            return this.getToken();
        } else {
            return token;
        }
    }

    async handle(formData: FormData) {
        const phone = formData.get('phone');
        const result = this.phoneSchema.safeParse(phone);
        if (!result.success) {
            return { token: false, error: result.error.flatten() };
        } else {
            // delete previous token
            await db.sMSToken.deleteMany({
                where: {
                    user: {
                        phone: result.data,
                    },
                },
            });
            // create token
            const token = await this.getToken();
            await db.sMSToken.create({
                data: {
                    token,
                    user: {
                        connectOrCreate: {
                            where: {
                                phone: result.data,
                            },
                            create: {
                                username: crypto
                                    .randomBytes(10)
                                    .toString('hex'),
                                phone: result.data,
                            },
                        },
                    },
                },
            });
            // send token using twilio
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID!,
                process.env.TWILIO_AUTH_TOKEN!
            );
            await client.messages.create({
                body: `Your Karrot verification code is ${token}`,
                from: process.env.TWILIO_PHONE_NUMBER!,
                to: process.env.TWILIO_MY_PHONE_NUMBER!,
            });
            return { token: true };
        }
    }
}

class HasTokenState implements State {
    private tokenSchema = z.coerce
        .number()
        .min(100000)
        .max(999999)
        .refine(this.tokenExists.bind(this), 'This token does not exist.');

    private async tokenExists(token: number) {
        const exists = await db.sMSToken.findUnique({
            where: {
                token: token.toString(),
            },
            select: {
                id: true,
            },
        });
        return Boolean(exists);
    }

    async handle(formData: FormData) {
        const token = formData.get('token');
        const tokenResult = await this.tokenSchema.spa(token);
        if (!tokenResult.success) {
            return { token: true, error: tokenResult.error.flatten() };
        } else {
            const tokenData = await db.sMSToken.findUnique({
                where: {
                    token: tokenResult.data.toString(),
                },
                select: {
                    id: true,
                    userId: true,
                },
            });
            await setSession(tokenData!.userId);
            await db.sMSToken.delete({
                where: {
                    id: tokenData!.id,
                },
            });

            redirect('/profile');
        }
    }
}

export async function smsLogin(prevState: ActionState, formData: FormData) {
    const state: State = prevState.token
        ? new HasTokenState()
        : new NoTokenState();
    return await state.handle(formData);
}
