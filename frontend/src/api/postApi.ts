import axiosInstance from './axiosInstance';
import type { Post, PostDetail, PostRequest } from '../types';

export const getPosts = async (): Promise<Post[]> => {
    const { data } = await axiosInstance.get('/api/posts');
    return data;
};

export const getPost = async (filename: string): Promise<PostDetail> => {
    const { data } = await axiosInstance.get(`/api/posts/${filename}`);
    return data;
};

// 글 작성 — 로그인한 관리자만 가능 (서버에서 권한 검증)
export const createPost = async (req: PostRequest): Promise<PostDetail> => {
    const { data } = await axiosInstance.post('/api/posts', req);
    return data;
};

// 글 수정
export const updatePost = async (filename: string, req: PostRequest): Promise<PostDetail> => {
    const { data } = await axiosInstance.put(`/api/posts/${filename}`, req);
    return data;
};

// 글 삭제
export const deletePost = async (filename: string): Promise<void> => {
    await axiosInstance.delete(`/api/posts/${filename}`);
};
