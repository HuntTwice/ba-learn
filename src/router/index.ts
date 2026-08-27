import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', redirect: '/login'},
        {path: '/login', component: () => import("@/views/login/LoginView.vue")},
        {
            path: '/admin',
            component: () => import("@/layouts/AdminLayout.vue"),
            children: [
                {path: '', redirect: '/admin/home'},
                {path: 'home', component: () => import("@/views/home/HomeView.vue")},
                {path: 'users/:id', name: 'user-detail', component: () => import('@/views/user/UserDetailView.vue')}
            ]
        },
        {path: '/:pathMatch(.*)*', component: () => import("@/views/error/NotFoundView.vue")}
    ],
})

export default router
