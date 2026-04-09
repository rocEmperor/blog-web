import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import PostDetailPage from '../views/PostDetailPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ForgotPasswordPage from '../views/ForgotPasswordPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import EditorPage from '../views/EditorPage.vue'
import SettingsPage from '../views/SettingsPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import NotFoundPage from '../views/NotFoundPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage, meta: { appPage: true, bodyClass: 'home-page' } },
    { path: '/post/:id', name: 'post-detail', component: PostDetailPage, meta: { appPage: true, bodyClass: 'post-detail-page' } },
    { path: '/login', name: 'login', component: LoginPage, meta: { hideHeader: true } },
    { path: '/register', name: 'register', component: RegisterPage, meta: { hideHeader: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordPage, meta: { hideHeader: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage, meta: { appPage: true, bodyClass: 'dashboard-page' } },
    { path: '/editor/:id?', name: 'editor', component: EditorPage, meta: { appPage: true, bodyClass: 'editor-page' } },
    { path: '/settings', name: 'settings', component: SettingsPage, meta: { appPage: true, bodyClass: 'settings-page' } },
    { path: '/profile/:username?', name: 'profile', component: ProfilePage, meta: { appPage: true, bodyClass: 'profile-page' } },
    { path: '/404', name: '404', component: NotFoundPage, meta: { appPage: true, bodyClass: 'settings-page error-page' } },
    { path: '/:pathMatch(.*)*', redirect: '/404' },
  ],
})

export default router
