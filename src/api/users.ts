// 导入 request
// 导入 User 类型

import {request} from "@/utils/http.ts";
import type {User} from "@/api/types.ts";

export interface UserQuery {
    page: number
}

export function getUsers(
    params: UserQuery,
    signal?: AbortSignal,
) {
    // 返回 request<User[]>({...})
    return request<User[]>({
        url: '/users',
        method: 'GET',
        params,
        signal,
    });
}