export interface User {
    user_id: number;
    full_name: string;
    email: string;
    phone_number: string;
    role: string;
    email_verified: boolean;
    verification_token: string;
    created_at: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface UserRegister {
    full_name: string;
    email: string;
    password: string;
}

export interface UserConnected {
    message: string;
    token: string;
    user: User;
}
