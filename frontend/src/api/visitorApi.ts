import axiosInstance from './axiosInstance';
import type { VisitorStats } from '../types';

export const recordVisit = (): Promise<void> =>
    axiosInstance.post('/api/visitors').then(() => {}).catch(() => {});

export const getVisitorStats = (): Promise<VisitorStats> =>
    axiosInstance.get<VisitorStats>('/api/visitors').then(res => res.data);
