import axiosInstance from './axiosInstance';
import type { Comment } from '../types';

export const getComments = async (filename: string): Promise<Comment[]> => {
    const { data } = await axiosInstance.get(`/api/posts/${filename}/comments`);
    return data;
};

export const createComment = async (filename: string, content: string): Promise<Comment> => {
    const { data } = await axiosInstance.post(`/api/posts/${filename}/comments`, { content });
    return data;
};

export const createReply = async (filename: string, commentId: number, content: string): Promise<Comment> => {
    const { data } = await axiosInstance.post(`/api/posts/${filename}/comments/${commentId}/reply`, { content });
    return data;
};

export const deleteComment = async (filename: string, commentId: number): Promise<void> => {
    await axiosInstance.delete(`/api/posts/${filename}/comments/${commentId}`);
};

export const deleteReply = async (filename: string, commentId: number): Promise<void> => {
    await axiosInstance.delete(`/api/posts/${filename}/comments/${commentId}/reply`);
};