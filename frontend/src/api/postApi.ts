import axiosInstance from './axiosInstance';
import type { Post, PostDetail } from '../types';

export const getPosts = async (): Promise<Post[]> => {
    const { data } = await axiosInstance.get('/api/posts');
    return data;
};

export const getPost = async (filename: string): Promise<PostDetail> => {
    const { data } = await axiosInstance.get(`/api/posts/${filename}`);
    return data;
};