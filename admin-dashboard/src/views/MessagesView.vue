<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-bold text-white mb-2">Messages</h1>
      <p class="text-slate-400">Manage contact form submissions</p>
    </div>

    <!-- Filters -->
    <div class="flex gap-4 flex-wrap">
      <button
        @click="filterBy = 'all'"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          filterBy === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300',
        ]"
      >
        All ({{ allMessages.length }})
      </button>
      <button
        @click="filterBy = 'unread'"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          filterBy === 'unread'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300',
        ]"
      >
        Unread ({{ unreadMessages.length }})
      </button>
      <button
        @click="filterBy = 'archived'"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          filterBy === 'archived'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300',
        ]"
      >
        Archived ({{ archivedMessages.length }})
      </button>
    </div>

    <!-- Messages List -->
    <div v-if="filteredMessages.length > 0" class="space-y-4">
      <div
        v-for="message in filteredMessages"
        :key="message._id"
        class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
        @click="selectedMessage = message"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-bold text-white">{{ message.name }}</h3>
              <span
                v-if="!message.isRead"
                class="w-2 h-2 bg-blue-600 rounded-full"
              />
              <span
                v-if="message.isArchived"
                class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded"
              >
                Archived
              </span>
              <span
                v-if="message.reply"
                class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded"
              >
                Replied
              </span>
            </div>
            <p class="text-slate-400 text-sm">{{ message.email }}</p>
            <p class="text-slate-300 mt-2 line-clamp-2">
              {{ message.message }}
            </p>
          </div>
          <p class="text-slate-500 text-sm ml-4">
            {{ new Date(message.submittedAt).toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-else
      class="text-center py-12 bg-slate-800 rounded-lg border border-slate-700"
    >
      <p class="text-slate-400">No messages to display</p>
    </div>

    <!-- Message Detail Modal -->
    <div
      v-if="selectedMessage"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="selectedMessage = null"
    >
      <div
        class="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div
          class="flex justify-between items-center p-6 border-b border-slate-700 sticky top-0 bg-slate-800"
        >
          <h2 class="text-2xl font-bold text-white">Message Details</h2>
          <button
            @click="selectedMessage = null"
            class="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Sender Info -->
          <div>
            <p class="text-slate-400 text-sm mb-1">From</p>
            <p class="text-white font-medium">{{ selectedMessage.name }}</p>
            <p class="text-slate-400">{{ selectedMessage.email }}</p>
            <p class="text-slate-500 text-sm mt-2">
              Submitted:
              {{ new Date(selectedMessage.submittedAt).toLocaleString() }}
            </p>
          </div>

          <!-- Original Message -->
          <div class="pt-4 border-t border-slate-700">
            <p class="text-slate-400 text-sm mb-2">Message</p>
            <p class="text-white whitespace-pre-wrap">
              {{ selectedMessage.message }}
            </p>
          </div>

          <!-- Reply Section -->
          <div class="pt-4 border-t border-slate-700">
            <p class="text-slate-400 text-sm mb-2">Reply</p>
            <textarea
              v-model="replyText"
              class="form-input h-32"
              placeholder="Type your reply here..."
              :disabled="selectedMessage.reply !== undefined"
            />

            <div
              v-if="selectedMessage.reply"
              class="mt-4 p-4 bg-slate-700 rounded-lg"
            >
              <p class="text-slate-400 text-sm mb-2">
                Your Reply (sent
                {{
                  selectedMessage.repliedAt
                    ? new Date(selectedMessage.repliedAt).toLocaleString()
                    : "N/A"
                }})
              </p>
              <p class="text-white whitespace-pre-wrap">
                {{ selectedMessage.reply }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-700 flex gap-3 flex-wrap">
            <button
              v-if="!selectedMessage.reply && replyText.trim()"
              @click="submitReply"
              :disabled="replyLoading"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white rounded-lg transition-colors"
            >
              {{ replyLoading ? "Sending..." : "Send Reply" }}
            </button>

            <button
              v-if="!selectedMessage.isRead"
              @click="markAsRead"
              :disabled="replyLoading"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Mark as Read
            </button>

            <button
              v-if="!selectedMessage.isArchived"
              @click="archiveMessage"
              :disabled="replyLoading"
              class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Archive
            </button>

            <button
              @click="deleteMessage"
              :disabled="replyLoading"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>

          <div
            v-if="replyError"
            class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
          >
            {{ replyError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { apiService } from "../services/api.service";
import type { Message } from "../types";

const allMessages = ref<Message[]>([]);
const selectedMessage = ref<Message | null>(null);
const filterBy = ref<"all" | "unread" | "archived">("all");
const replyText = ref("");
const replyLoading = ref(false);
const replyError = ref("");

const unreadMessages = computed(() =>
  allMessages.value.filter((m) => !m.isRead && !m.isArchived),
);

const archivedMessages = computed(() =>
  allMessages.value.filter((m) => m.isArchived),
);

const filteredMessages = computed(() => {
  if (filterBy.value === "unread") {
    return unreadMessages.value;
  } else if (filterBy.value === "archived") {
    return archivedMessages.value;
  }
  return allMessages.value;
});

const loadMessages = async () => {
  try {
    const response = await apiService.getMessages();
    if (response.success && response.data) {
      allMessages.value = Array.isArray(response.data) ? response.data : [];
    }
  } catch (error) {
    console.error("Error loading messages:", error);
  }
};

const submitReply = async () => {
  if (!selectedMessage.value) return;

  replyLoading.value = true;
  replyError.value = "";

  try {
    const response = await apiService.replyToMessage(
      selectedMessage.value._id,
      replyText.value,
    );

    if (response.success && response.data) {
      selectedMessage.value.reply = replyText.value;
      selectedMessage.value.repliedAt = new Date().toISOString();
      replyText.value = "";
      await loadMessages();
    } else {
      replyError.value = response.message || "Failed to send reply";
    }
  } catch (error) {
    replyError.value = "An error occurred while sending the reply";
  } finally {
    replyLoading.value = false;
  }
};

const markAsRead = async () => {
  if (!selectedMessage.value) return;

  try {
    const response = await apiService.markMessageAsRead(
      selectedMessage.value._id,
    );
    if (response.success) {
      selectedMessage.value.isRead = true;
      await loadMessages();
    }
  } catch (error) {
    replyError.value = "Failed to mark message as read";
  }
};

const archiveMessage = async () => {
  if (!selectedMessage.value) return;

  try {
    const response = await apiService.archiveMessage(selectedMessage.value._id);
    if (response.success) {
      selectedMessage.value.isArchived = true;
      await loadMessages();
    }
  } catch (error) {
    replyError.value = "Failed to archive message";
  }
};

const deleteMessage = async () => {
  if (!selectedMessage.value) return;

  if (confirm("Are you sure you want to delete this message?")) {
    try {
      const response = await apiService.deleteMessage(
        selectedMessage.value._id,
      );
      if (response.success) {
        selectedMessage.value = null;
        await loadMessages();
      }
    } catch (error) {
      replyError.value = "Failed to delete message";
    }
  }
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
