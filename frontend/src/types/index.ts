export interface Post {
    title: string;
    date: string;
    description: string;
    filename: string;
    category: string;
}

export interface PostDetail extends Post {
    content: string;
}

export interface Reply {
    avatarUrl: string;
    content: string;
    createdAt: string;
}

export interface Comment {
    id: number;
    author: string;
    avatarUrl: string;
    content: string;
    createdAt: string;
    reply: Reply | null;
}

export interface GuestbookItem {
    id: number;
    title: string;
    content: string;
    author: string;
    avatarUrl: string;
    createdAt: string;
    reply: Reply | null;
}

export interface AuthToken {
    accessToken: string;
    username: string;
    avatarUrl: string;
}

export interface AuthState {
    isLoggedIn: boolean;
    username: string;
    avatarUrl: string;
}

export interface VisitorStats {
    totalViews: number;
    todayViews: number;
    weekViews: number;
    dailyCounts: Record<string, Record<string, number>>;
}
