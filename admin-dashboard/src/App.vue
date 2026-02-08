<template>
  <div
    v-if="isAuthenticated"
    class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
  >
    <!-- Sidebar Navigation -->
    <div
      class="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700 p-6"
    >
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white">Admin</h1>
        <p class="text-slate-400 text-sm">Portfolio Dashboard</p>
      </div>

      <nav class="space-y-2">
        <router-link
          to="/dashboard"
          active-class="bg-blue-600"
          class="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          📊 Dashboard
        </router-link>
        <router-link
          to="/projects"
          active-class="bg-blue-600"
          class="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          🎯 Projects
        </router-link>
        <router-link
          to="/content"
          active-class="bg-blue-600"
          class="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          ✏️ Content
        </router-link>
        <router-link
          to="/messages"
          active-class="bg-blue-600"
          class="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          💬 Messages
        </router-link>
        <router-link
          to="/analytics"
          active-class="bg-blue-600"
          class="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          📈 Analytics
        </router-link>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="ml-64 p-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </div>
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAuthStore } from "./stores/auth.store";

const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(async () => {
  await authStore.restoreSession();
});
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

* {
  @apply transition-all duration-200;
}

body {
  @apply bg-slate-900 text-white;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
