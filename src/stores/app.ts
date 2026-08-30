import {defineStore} from "pinia";
import {computed, ref} from "vue";

export const useAppStore = defineStore('app', () => {
    const sidebarCollapsed = ref(false)

    const sidebarWidth = computed(() => sidebarCollapsed.value ? '64px' : '220px')

    const sidebarActionText = computed(() => sidebarCollapsed.value ? '展开侧边栏' : '折叠侧边栏')

    function toggleSidebar() {
        sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setSidebarCollapsed(value: boolean) {
        sidebarCollapsed.value = value
    }


    return {
        sidebarCollapsed,
        sidebarWidth,
        sidebarActionText,
        toggleSidebar,
        setSidebarCollapsed
    }
})