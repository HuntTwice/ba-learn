import axios from "axios";
import type {ApiResponse} from "@/api/types.ts";
import type {AxiosRequestConfig} from 'axios'
import {useUserStore} from "@/stores/user.ts";
import {storeToRefs} from "pinia";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
})


http.interceptors.request.use((config) => {
    // const token = sessionStorage.getItem("token")
    const userStore = useUserStore()
    if (userStore.token)
        config.headers.Authorization = `Bearer ${userStore.token}`
    return config
});


http.interceptors.response.use((res) => {
    const result: ApiResponse<unknown> = res.data

    if (result.code !== 1) {
        return Promise.reject(new Error(result.message))
    }
    return res
}, (err) => {
    return Promise.reject(err)
})

export async function request<T>(
    config: AxiosRequestConfig,
): Promise<T> {

    const res = await http.request<ApiResponse<T>>(config)
    return res.data.data

}