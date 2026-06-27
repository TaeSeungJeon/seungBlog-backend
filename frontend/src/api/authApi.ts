import axiosInstance from './axiosInstance';
import type { AuthToken } from '../types';

export const githubLogin = async (code: string): Promise<AuthToken> => {
    const { data } = await axiosInstance.post(`/api/auth/github?code=${code}`);
    return data;
};
