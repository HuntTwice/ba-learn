export interface AdminMenuRule {
    path: string
    name: string
    title: string
    type: 'menu' | 'menu_dir' | 'button'
    menuType?: 'tab' | 'link'
    component?: string
    children?: AdminMenuRule[]
}


export const adminMenuRules: AdminMenuRule[] = [
    {component: "/src/views/home/HomeView.vue", menuType: "tab", name: "admin-home", path: "home", title: "首页", type: "menu"},
    {component: "/src/views/user/UserDetailView.vue", menuType: "tab", name: "user-detail", path: "users/:id", title: "用户详情", type: "menu"}
]