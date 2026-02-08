<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p class="text-slate-400">
          Welcome back, {{ authStore.user?.username }}!
        </p>
      </div>
      <button
        @click="logout"
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        Logout
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm mb-1">Published Projects</p>
            <p class="text-3xl font-bold text-white">
              {{ stats.publishedProjects }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center"
          >
            <span class="text-blue-400 text-xl">📊</span>
          </div>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm mb-1">Unread Messages</p>
            <p class="text-3xl font-bold text-white">
              {{ stats.unreadMessages }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center"
          >
            <span class="text-green-400 text-xl">💬</span>
          </div>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm mb-1">Total Page Views</p>
            <p class="text-3xl font-bold text-white">{{ stats.pageViews }}</p>
          </div>
          <div
            class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center"
          >
            <span class="text-purple-400 text-xl">👀</span>
          </div>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm mb-1">Total Projects</p>
            <p class="text-3xl font-bold text-white">
              {{ stats.totalProjects }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center"
          >
            <span class="text-orange-400 text-xl">🎯</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 class="text-xl font-bold text-white mb-4">Recent Messages</h2>
        <div v-if="recentMessages.length > 0" class="space-y-3">
          <div
            v-for="msg in recentMessages.slice(0, 3)"
            :key="msg._id"
            class="p-3 bg-slate-700 rounded-lg text-sm"
          >
            <p class="text-white font-medium">{{ msg.name }}</p>
            <p class="text-slate-400 truncate">{{ msg.message }}</p>
            <p class="text-slate-500 text-xs mt-1">
              {{ new Date(msg.submittedAt).toLocaleDateString() }}
            </p>
          </div>
        </div>
        <div v-else class="text-slate-400 text-sm">No messages yet</div>
        <router-link
          to="/messages"
          class="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          View All Messages
        </router-link>
      </div>

      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 class="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-3">
          <router-link
            to="/projects"
            class="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <p class="text-xl mb-2">🎯</p>
            <p class="text-white font-medium text-sm group-hover:text-blue-400">
              Projects
            </p>
          </router-link>
          <router-link
            to="/messages"
            class="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <p class="text-xl mb-2">💬</p>
            <p class="text-white font-medium text-sm group-hover:text-blue-400">
              Messages
            </p>
          </router-link>
          <router-link
            to="/content"
            class="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <p class="text-xl mb-2">✏️</p>
            <p class="text-white font-medium text-sm group-hover:text-blue-400">
              Content
            </p>
          </router-link>
          <router-link
            to="/analytics"
            class="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <p class="text-xl mb-2">📈</p>
            <p class="text-white font-medium text-sm group-hover:text-blue-400">
              Analytics
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import { apiService } from "../services/api.service";
import type { Message } from "../types";

const router = useRouter();
const authStore = useAuthStore();

const stats = ref({
  publishedProjects: 0,
  unreadMessages: 0,
  pageViews: 0,
  totalProjects: 0,
});

const recentMessages = ref<Message[]>([]);

const loadDashboardData = async () => {
  try {
    const [projectsRes, messagesRes, summaryRes] = await Promise.all([
      apiService.getProjects(),
      apiService.getMessages(),
      apiService.getTelemetrySummary(),
    ]);

    if (projectsRes.success && projectsRes.data) {
      const projects = projectsRes.data;
      stats.value.totalProjects = Array.isArray(projects) ? projects.length : 0;
      stats.value.publishedProjects = Array.isArray(projects)
        ? projects.filter((p: any) => p.isPublished).length
        : 0;
    }

    if (messagesRes.success && messagesRes.data) {
      const messages = messagesRes.data;
      recentMessages.value = Array.isArray(messages) ? messages : [];
      stats.value.unreadMessages = Array.isArray(messages)
        ? messages.filter((m: any) => !m.isRead).length
        : 0;
    }

    if (summaryRes.success && summaryRes.data) {
      stats.value.pageViews = summaryRes.data.totalPageViews || 0;
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
};

const logout = async () => {
  await authStore.logout();
  router.push("/login");
};

onMounted(() => {
  loadDashboardData();
});
</script>
