import {defineStore} from "pinia";
import {computed, type Ref, ref} from "vue";

export interface NavTab {
    title: string
    fullPath: string
    fixed: boolean
    cacheName?: string
}

export const useNavTabsStore = defineStore('navTabs', () => {
    const tabs: Ref<Array<NavTab>> = ref([{
        fixed: true, fullPath: "/admin/home", title: "首页",cacheName:'HomeView'
    }])
    const cacheNames = computed(() => {
        const names: string[] = []

        // 遍历 tabs.value
        tabs.value.forEach((item)=>{
            if(item.cacheName &&!names.includes(item.cacheName))
                names.push(item.cacheName)
        })

        return names
    })
    const addTab = (tab: NavTab) => {
        const existedTab = tabs.value.find((item)=>item.fullPath == tab.fullPath);
        if (!existedTab)
            tabs.value.push(tab)
    }
    const removeTab = (fullPath: string) => {
        const index = tabs.value.findIndex((item) => item.fullPath === fullPath);
        if (index === -1)
            return
        if (tabs.value[index]!.fixed)
            return
        tabs.value.splice(index, 1)
    };
    return {tabs, addTab,removeTab,cacheNames}
})