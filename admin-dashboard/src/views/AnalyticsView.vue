<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-bold text-white mb-2">Analytics</h1>
      <p class="text-slate-400">Track your portfolio performance</p>
    </div>

    <!-- Date Range Picker -->
    <div
      class="flex gap-4 flex-wrap bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <div>
        <label class="block text-slate-300 text-sm font-medium mb-2"
          >Start Date</label
        >
        <input
          v-model="startDate"
          type="date"
          class="form-input"
          @change="loadAnalytics"
        />
      </div>
      <div>
        <label class="block text-slate-300 text-sm font-medium mb-2"
          >End Date</label
        >
        <input
          v-model="endDate"
          type="date"
          class="form-input"
          @change="loadAnalytics"
        />
      </div>
      <div class="flex items-end">
        <button
          @click="resetDateRange"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p class="text-slate-400 text-sm mb-2">Total Page Views</p>
        <p class="text-4xl font-bold text-white">
          {{ summary.totalPageViews || 0 }}
        </p>
        <p class="text-slate-500 text-sm mt-2">
          Unique visitors: {{ summary.uniqueVisitors || 0 }}
        </p>
      </div>

      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p class="text-slate-400 text-sm mb-2">Average Session Duration</p>
        <p class="text-4xl font-bold text-white">
          {{
            summary.avgSessionDuration
              ? formatDuration(summary.avgSessionDuration)
              : "N/A"
          }}
        </p>
        <p class="text-slate-500 text-sm mt-2">
          Total sessions: {{ summary.totalSessions || 0 }}
        </p>
      </div>

      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p class="text-slate-400 text-sm mb-2">Most Popular Page</p>
        <p class="text-2xl font-bold text-white break-words">
          {{ summary.mostPopularPage || "N/A" }}
        </p>
        <p class="text-slate-500 text-sm mt-2">
          Views: {{ summary.mostPopularPageViews || 0 }}
        </p>
      </div>
    </div>

    <!-- Events by Type -->
    <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 class="text-2xl font-bold text-white mb-4">Events by Type</h2>
      <div v-if="eventsByType.length > 0" class="space-y-3">
        <div
          v-for="event in eventsByType"
          :key="event.type"
          class="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
        >
          <div>
            <p class="text-white font-medium">
              {{ formatEventType(event.type) }}
            </p>
            <p class="text-slate-400 text-sm">{{ event.count }} occurrences</p>
          </div>
          <div class="w-32 bg-slate-600 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full"
              :style="{ width: (event.count / maxEventCount) * 100 + '%' }"
            />
          </div>
        </div>
      </div>
      <div v-else class="text-slate-400 text-center py-8">
        No events recorded
      </div>
    </div>

    <!-- Page Views by Path -->
    <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 class="text-2xl font-bold text-white mb-4">Page Views by Path</h2>
      <div v-if="pageViewsByPath.length > 0" class="space-y-3">
        <div
          v-for="page in pageViewsByPath"
          :key="page.path"
          class="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
        >
          <div>
            <p class="text-white font-medium">{{ page.path }}</p>
            <p class="text-slate-400 text-sm">{{ page.count }} views</p>
          </div>
          <div class="w-32 bg-slate-600 rounded-full h-2">
            <div
              class="bg-green-600 h-2 rounded-full"
              :style="{ width: (page.count / maxPageViews) * 100 + '%' }"
            />
          </div>
        </div>
      </div>
      <div v-else class="text-slate-400 text-center py-8">
        No page view data available
      </div>
    </div>

    <!-- Referrers -->
    <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 class="text-2xl font-bold text-white mb-4">Top Referrers</h2>
      <div v-if="referrers.length > 0" class="space-y-2">
        <div
          v-for="(ref, index) in referrers"
          :key="index"
          class="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
        >
          <a
            :href="ref"
            target="_blank"
            class="text-blue-400 hover:text-blue-300 text-sm truncate"
          >
            {{ ref }}
          </a>
        </div>
      </div>
      <div v-else class="text-slate-400 text-center py-8">
        No referrer data available
      </div>
    </div>

    <!-- Browser/Device Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 class="text-xl font-bold text-white mb-4">Top Browsers</h2>
        <div v-if="browsers.length > 0" class="space-y-2">
          <div
            v-for="browser in browsers"
            :key="browser"
            class="flex items-center justify-between p-2 bg-slate-700 rounded"
          >
            <p class="text-white text-sm">{{ browser }}</p>
          </div>
        </div>
        <div v-else class="text-slate-400 text-sm text-center py-4">
          No browser data
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 class="text-xl font-bold text-white mb-4">Top Countries</h2>
        <div v-if="countries.length > 0" class="space-y-2">
          <div
            v-for="country in countries"
            :key="country"
            class="flex items-center justify-between p-2 bg-slate-700 rounded"
          >
            <p class="text-white text-sm">{{ country }}</p>
          </div>
        </div>
        <div v-else class="text-slate-400 text-sm text-center py-4">
          No location data
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { apiService } from "../services/api.service";

const startDate = ref("");
const endDate = ref("");
const loading = ref(false);

const summary = ref({
  totalPageViews: 0,
  uniqueVisitors: 0,
  avgSessionDuration: 0,
  totalSessions: 0,
  mostPopularPage: "",
  mostPopularPageViews: 0,
});

const analytics = ref<any[]>([]);

const eventsByType = computed(() => {
  const events: { [key: string]: number } = {};
  analytics.value.forEach((a) => {
    events[a.eventName] = (events[a.eventName] || 0) + 1;
  });
  return Object.entries(events)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
});

const maxEventCount = computed(() => {
  const counts = eventsByType.value.map((e) => e.count);
  return Math.max(...counts, 1);
});

const pageViewsByPath = computed(() => {
  const pages: { [key: string]: number } = {};
  analytics.value
    .filter((a) => a.eventName === "page_view")
    .forEach((a) => {
      const path = a.metadata?.path || "unknown";
      pages[path] = (pages[path] || 0) + 1;
    });
  return Object.entries(pages)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
});

const maxPageViews = computed(() => {
  const counts = pageViewsByPath.value.map((p) => p.count);
  return Math.max(...counts, 1);
});

const referrers = computed(() => {
  const refs = new Set<string>();
  analytics.value.forEach((a) => {
    const referrer = a.metadata?.referrer;
    if (referrer && referrer !== "direct") {
      refs.add(referrer);
    }
  });
  return Array.from(refs).slice(0, 5);
});

const browsers = computed(() => {
  const browserList = new Set<string>();
  analytics.value.forEach((a) => {
    const browser = a.metadata?.browser || "Unknown";
    browserList.add(browser);
  });
  return Array.from(browserList).slice(0, 5);
});

const countries = computed(() => {
  const countryList = new Set<string>();
  analytics.value.forEach((a) => {
    const country = a.metadata?.country || "Unknown";
    countryList.add(country);
  });
  return Array.from(countryList).slice(0, 5);
});

const formatEventType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const loadAnalytics = async () => {
  loading.value = true;

  try {
    const response = await apiService.getAnalytics(
      startDate.value || undefined,
      endDate.value || undefined,
    );

    if (response.success && response.data) {
      analytics.value = Array.isArray(response.data) ? response.data : [];

      // Calculate summary
      const pageViews = analytics.value.filter(
        (a) => a.eventName === "page_view",
      );
      summary.value.totalPageViews = pageViews.length;

      const uniqueIPs = new Set(analytics.value.map((a) => a.metadata?.ip))
        .size;
      summary.value.uniqueVisitors = uniqueIPs;

      // Find most popular page
      const pages: { [key: string]: number } = {};
      pageViews.forEach((p) => {
        const path = p.metadata?.path || "unknown";
        pages[path] = (pages[path] || 0) + 1;
      });

      let maxViews = 0;
      let mostPopular = "";
      Object.entries(pages).forEach(([path, count]) => {
        if (count > maxViews) {
          maxViews = count;
          mostPopular = path;
        }
      });

      summary.value.mostPopularPage = mostPopular;
      summary.value.mostPopularPageViews = maxViews;
    }
  } catch (error) {
    console.error("Error loading analytics:", error);
  } finally {
    loading.value = false;
  }
};

const resetDateRange = () => {
  startDate.value = "";
  endDate.value = "";
  loadAnalytics();
};

const initializeDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  endDate.value = today.toISOString().split("T")[0];
  startDate.value = thirtyDaysAgo.toISOString().split("T")[0];
};

onMounted(() => {
  initializeDateRange();
  loadAnalytics();
});
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400;
}
</style>
