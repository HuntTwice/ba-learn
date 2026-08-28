import {createRouter, createWebHistory} from 'vue-router'
import { adminMenuRules } from '@/mock/adminMenu'
import { registerDynamicRoutes } from './dynamic'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', redirect: '/login'},
        {path: '/login', component: () => import("@/views/login/LoginView.vue")},
        {
            path: '/admin',
            name: 'admin',
            component: () => import("@/layouts/AdminLayout.vue"),
            children: [
                {path: '', redirect: '/admin/home'},
            ]
        },
        {path: '/:pathMatch(.*)*', component: () => import("@/views/error/NotFoundView.vue")}
    ],
})
const registeredNames = registerDynamicRoutes(router, adminMenuRules)
console.log('已注册动态路由：', registeredNames)
export default router
