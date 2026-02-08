import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export const useUiStore = defineStore("ui", () => {
  const notifications = ref<Notification[]>([]);
  const sidebarOpen = ref(true);
  const modals = ref<Record<string, boolean>>({});

  const unreadMessageCount = ref(0);

  const addNotification = (
    type: Notification["type"],
    message: string,
    duration = 5000,
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    };

    notifications.value.push(notification);

    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const openModal = (modalKey: string) => {
    modals.value[modalKey] = true;
  };

  const closeModal = (modalKey: string) => {
    modals.value[modalKey] = false;
  };

  const isModalOpen = (modalKey: string) => {
    return modals.value[modalKey] || false;
  };

  return {
    notifications,
    sidebarOpen,
    modals,
    unreadMessageCount,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleSidebar,
    openModal,
    closeModal,
    isModalOpen,
  };
});
