export interface AdminMenuRule {
    path?: string
    name: string
    title: string
    type: 'menu' | 'menu_dir' | 'button'
    menuType?: 'tab' | 'link'
    component?: string
    children?: AdminMenuRule[]
    cacheName?: string
}


export const adminMenuRules: AdminMenuRule[] = [
    {
        component: "/src/views/home/HomeView.vue",
        menuType: "tab",
        name: "admin-home",
        path: "home",
        title: "首页",
        type: "menu",
        cacheName: "HomeView"
    },
    // {component: "/src/views/user/UserDetailView.vue", menuType: "tab", name: "user-detail", path: "users/:id", title: "用户详情", type: "menu"}
    {
        name: 'system-management', type: 'menu_dir', title: '系统管理', children: [
            {
                name: 'user-management', type: 'menu_dir', title: '用户管理', children: [
                    {
                        component: "/src/views/user/UserDetailView.vue",
                        menuType: "tab",
                        name: "user-detail",
                        path: "users/:id",
                        title: "用户详情",
                        type: "menu",
                        cacheName: 'UserDetailView',
                    }
                ]
            }
        ]
    }
]