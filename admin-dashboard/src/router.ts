import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import AuthView from "../views/AuthView.vue";
import DashboardView from "../views/DashboardView.vue";
import ProjectsView from "../views/ProjectsView.vue";
import ContentView from "../views/ContentView.vue";
import MessagesView from "../views/MessagesView.vue";
import AnalyticsView from "../views/AnalyticsView.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: AuthView,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects",
    name: "Projects",
    component: ProjectsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/content",
    name: "Content",
    component: ContentView,
    meta: { requiresAuth: true },
  },
  {
    path: "/messages",
    name: "Messages",
    component: MessagesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: AnalyticsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Restore session if not already done
  if (!authStore.user && !authStore.isAuthenticated) {
    await authStore.restoreSession();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
