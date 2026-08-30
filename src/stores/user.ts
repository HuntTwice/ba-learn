import {defineStore} from "pinia";
import {computed, ref} from "vue";
export interface UserProfile {
    id: number
    username: string
    nickname: string
    token: string
}
export const useUserStore = defineStore('user', () => {
    const id = ref(0)
    const username = ref('')
    const nickname = ref('')
    const token = ref('')

    const displayName = computed(() => nickname.value || username.value || '未登录',
    )
    function updateNickname(value: string) {
        nickname.value = value.trim()
    }
    function setUser(profile: UserProfile) {
        id.value = profile.id
        username.value = profile.username
        nickname.value = profile.nickname
        token.value = profile.token
    }

    function clearUser() {
        id.value = 0
        nickname.value = ''
        username.value = ''
        token.value = ''
    }
    return {
        id,
        username,
        nickname,
        token,
        displayName,
        updateNickname,
        setUser,
        clearUser,
    }


})