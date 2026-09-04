import {request} from "@/utils/http.ts";
import type {UserProfile} from "@/stores/user.ts";

export interface LoginInput {
    username: string,
    password: string
}

export const login = (input: LoginInput) => {
    return request<UserProfile>({
        url: '/login',
        method: 'POST',
        data: input,
    })
}