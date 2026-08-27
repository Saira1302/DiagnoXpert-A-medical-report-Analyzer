export interface SignupState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

export interface SignUpUser{
    username: string;
    email: string;
    password: string;
    dateOfBirth: string;
    phoneNumber: string;
    role: string;
}