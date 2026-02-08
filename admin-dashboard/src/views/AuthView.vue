<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Portfolio Admin</h1>
        <p class="text-slate-400">Manage your portfolio</p>
      </div>

      <div class="flex gap-4 mb-8 border-b border-slate-700">
        <button
          @click="mode = 'login'"
          :class="[
            'flex-1 py-2 px-4 font-medium transition-colors border-b-2 -mb-px',
            mode === 'login'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-slate-300',
          ]"
        >
          Login
        </button>
        <button
          @click="mode = 'register'"
          :class="[
            'flex-1 py-2 px-4 font-medium transition-colors border-b-2 -mb-px',
            mode === 'register'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-slate-300',
          ]"
        >
          Register
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="mode === 'register'">
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Username
          </label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Password
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
            placeholder="••••••••"
          />
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            v-model="form.passwordConfirm"
            type="password"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
            placeholder="••••••••"
          />
        </div>

        <div
          v-if="error"
          class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {{ loading ? "Loading..." : mode === "login" ? "Login" : "Register" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

const router = useRouter();
const authStore = useAuthStore();

const mode = ref<"login" | "register">("login");
const loading = ref(false);
const error = ref("");

const form = ref({
  email: "",
  password: "",
  username: "",
  passwordConfirm: "",
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";

  try {
    if (mode.value === "login") {
      const response = await authStore.login(
        form.value.email,
        form.value.password,
      );
      if (response.success) {
        router.push("/dashboard");
      } else {
        error.value = response.message || "Login failed";
      }
    } else {
      const response = await authStore.register(
        form.value.email,
        form.value.username,
        form.value.password,
        form.value.passwordConfirm,
      );
      if (response.success) {
        router.push("/dashboard");
      } else {
        error.value = response.message || "Registration failed";
      }
    }
  } catch (err) {
    error.value = "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
