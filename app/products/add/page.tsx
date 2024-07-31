'use client';

import Button from '@/components/button';
import Input from '@/components/input';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { getUploadUrl, uploadProduct } from './actions';
import { useFormState } from 'react-dom';

export default function AddProduct() {
    const [preview, setPreview] = useState('');
    const [uploadURL, setUploadUrl] = useState('');
    const [photoId, setImageId] = useState('');
    const onImageChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {
            target: { files },
        } = event;
        if (!files) {
            return;
        }
        const file = files[0];
        if (!file.type.includes('image')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('이미지 파일은 2MB 이하만 업로드 가능합니다.');
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);
        const { success, result } = await getUploadUrl();
        if (success) {
            const { id, uploadURL } = result;
            setUploadUrl(uploadURL);
            setImageId(id);
        }
    };
    const interceptAction = async (_: any, formData: FormData) => {
        const file = formData.get('photo');
        if (!file) {
            return;
        }
        const cloudFlareForm = new FormData();
        cloudFlareForm.append('file', file);
        const response = await fetch(uploadURL, {
            method: 'POST',
            body: cloudFlareForm,
        });
        if (response.status !== 200) {
            return;
        }
        const photoUrl = `https://imagedelivery.net/O9z9Gvg3_K_y87qLiKMdAA/${photoId}`;
        formData.set('photo', photoUrl);
        return uploadProduct(_, formData);
    };
    const [state, action] = useFormState(interceptAction, null);
    return (
        <div>
            <form action={action} className="flex flex-col gap-5 p-5">
                <label
                    htmlFor="photo"
                    className="border-2 border-dashed rounded-md aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 cursor-pointer bg-center bg-cover"
                    style={{ backgroundImage: `url(${preview})` }}
                >
                    {preview === '' && (
                        <>
                            <PhotoIcon className="w-10" />
                            <div className="text-neutral-400 text-sm">
                                사진을 추가해주세요.
                            </div>
                        </>
                    )}
                </label>
                <input
                    onChange={onImageChange}
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    className="hidden"
                />
                <Input
                    name="title"
                    required
                    placeholder="제목"
                    type="text"
                    errors={state?.fieldErrors.title}
                />
                <Input
                    name="price"
                    required
                    placeholder="가격"
                    type="number"
                    errors={state?.fieldErrors.price}
                />
                <Input
                    name="description"
                    type="text"
                    required
                    placeholder="자세한 설명"
                    errors={state?.fieldErrors.description}
                />
                <Button text="상품 등록 완료" />
            </form>
        </div>
    );
}
