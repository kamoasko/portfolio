import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "./stores/auth.store";
import DashboardView from "./views/DashboardView.vue";
import AuthView from "./views/AuthView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: AuthView,
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: "Register",
    component: AuthView,
    meta: { guestOnly: true },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("./views/ProjectsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/content",
    name: "Content",
    component: () => import("./views/ContentView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/messages",
    name: "Messages",
    component: () => import("./views/MessagesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: () => import("./views/AnalyticsView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "Login" });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;