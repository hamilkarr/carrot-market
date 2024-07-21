'use client';

import Button from '@/components/button';
import Input from '@/components/input';
import { smsLogin } from './actions';
import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';

const initialState = {
    token: false,
    error: undefined,
};

export default function SMSLogIn() {
    const [state, dispatch] = useFormState(smsLogin, initialState);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setInputValue('');
    }, [state.token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };


    return (
        <div className="flex flex-col gap-10 py-8 px-6">
            <div className="flex flex-col gap-2 *:font-medium">
                <h1 className="text-2xl">SMS Login</h1>
                <h2 className="text-xl">Verify your phone number</h2>
            </div>
            <form action={dispatch} className="flex flex-col gap-3">
                {state.token ? (
                    <Input
                        name="token"
                        type="number"
                        placeholder="Verification code"
                        autoComplete='off'
                        required
                        min={100000}
                        max={999999}
                        errors={state.error?.formErrors}
                        value={inputValue}
                        onChange={handleChange}
                    />
                ) : (
                    <Input
                        name="phone"
                        type="text"
                        placeholder="Phone number"
                        required
                        errors={state.error?.formErrors}
                        value={inputValue}
                        onChange={handleChange}
                    />
                )}

                <Button
                    text={
                        state?.token ? 'Verify Token' : 'Send Verification SMS'
                    }
                />
            </form>
        </div>
    );
}
