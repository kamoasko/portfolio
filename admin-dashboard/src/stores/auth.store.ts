import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { User, AuthResponse } from "../types";
import { apiService } from "../services/api.service";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  // Initialize from localStorage if available
  apiService.loadTokensFromStorage();

  // Try to restore session
  const restoreSession = async () => {
    try {
      if (apiService.getAccessToken()) {
        const response = await apiService.getMe();
        if (response.success && response.data) {
          user.value = response.data;
        } else {
          apiService.clearTokens();
        }
      }
    } catch (error) {
      apiService.clearTokens();
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    passwordConfirm: string,
  ) => {
    const response = await apiService.register(
      email,
      username,
      password,
      passwordConfirm,
    );
    if (response.success && response.data) {
      const { accessToken, refreshToken, user: newUser } = response.data;
      apiService.setTokens(accessToken, refreshToken);
      user.value = newUser;
    }
    return response;
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    if (response.success && response.data) {
      const { accessToken, refreshToken, user: newUser } = response.data;
      apiService.setTokens(accessToken, refreshToken);
      user.value = newUser;
    }
    return response;
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } finally {
      user.value = null;
    }
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    restoreSession,
  };
});
