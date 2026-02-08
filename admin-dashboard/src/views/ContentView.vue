<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-bold text-white mb-2">Content Management</h1>
      <p class="text-slate-400">Edit your portfolio content sections</p>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-4 border-b border-slate-700">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        :class="[
          'py-4 px-6 font-medium border-b-2 -mb-px transition-colors',
          activeTab === tab
            ? 'text-blue-400 border-blue-400'
            : 'text-slate-400 border-transparent hover:text-slate-300',
        ]"
      >
        {{ tabLabels[tab] }}
      </button>
    </div>

    <!-- Hero Section -->
    <div
      v-if="activeTab === 'hero'"
      class="bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <form @submit.prevent="submitHero" class="space-y-4">
        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2"
            >Hero Title</label
          >
          <input
            v-model="heroData.heroTitle"
            type="text"
            class="form-input"
            placeholder="Main headline of your portfolio"
          />
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Hero Tagline
          </label>
          <input
            v-model="heroData.heroTagline"
            type="text"
            class="form-input"
            placeholder="Brief tagline or subtitle"
          />
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2"
            >Hero Image URL</label
          >
          <input
            v-model="heroData.heroImage"
            type="url"
            class="form-input"
            placeholder="https://example.com/hero.jpg"
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
          {{ loading ? "Saving..." : "Save Hero Section" }}
        </button>
      </form>
    </div>

    <!-- About Section -->
    <div
      v-if="activeTab === 'about'"
      class="bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <form @submit.prevent="submitAbout" class="space-y-4">
        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2">
            About Description
          </label>
          <textarea
            v-model="aboutData.aboutDescription"
            class="form-input h-40"
            placeholder="Tell your story..."
          />
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2"
            >About Image URL</label
          >
          <input
            v-model="aboutData.aboutImage"
            type="url"
            class="form-input"
            placeholder="https://example.com/about.jpg"
          />
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2"
            >About Image Alt Text</label
          >
          <input
            v-model="aboutData.aboutImageAlt"
            type="text"
            class="form-input"
            placeholder="Description for accessibility"
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
          {{ loading ? "Saving..." : "Save About Section" }}
        </button>
      </form>
    </div>

    <!-- Skills Section -->
    <div
      v-if="activeTab === 'skills'"
      class="bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <form @submit.prevent="submitSkills" class="space-y-6">
        <div
          v-for="(skill, index) in skillsData"
          :key="index"
          class="p-4 bg-slate-700 rounded-lg"
        >
          <div class="flex justify-between items-center mb-3">
            <label class="text-slate-300 text-sm font-medium"
              >Skill Category</label
            >
            <button
              v-if="skillsData.length > 1"
              @click.prevent="skillsData.splice(index, 1)"
              type="button"
              class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            >
              Remove
            </button>
          </div>

          <input
            v-model="skill.category"
            type="text"
            class="form-input mb-3"
            placeholder="e.g., Frontend, Backend"
          />

          <label class="block text-slate-300 text-sm font-medium mb-2">
            Skills (comma-separated)
          </label>
          <textarea
            v-model="skill.itemsText"
            class="form-input h-24"
            placeholder="React, Vue, Angular"
            @blur="
              skill.items = skill.itemsText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            "
          />
        </div>

        <button
          type="button"
          @click.prevent="
            skillsData.push({ category: '', items: [], itemsText: '' })
          "
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
        >
          + Add Skill Category
        </button>

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
          {{ loading ? "Saving..." : "Save Skills" }}
        </button>
      </form>
    </div>

    <!-- Social Links Section -->
    <div
      v-if="activeTab === 'social'"
      class="bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <form @submit.prevent="submitSocial" class="space-y-4">
        <div
          v-for="(link, index) in socialLinks"
          :key="index"
          class="flex gap-3 items-end"
        >
          <div class="flex-1">
            <label class="block text-slate-300 text-sm font-medium mb-2"
              >Platform</label
            >
            <input
              v-model="link.platform"
              type="text"
              class="form-input"
              placeholder="GitHub, LinkedIn, Twitter"
            />
          </div>
          <div class="flex-1">
            <label class="block text-slate-300 text-sm font-medium mb-2"
              >URL</label
            >
            <input
              v-model="link.url"
              type="url"
              class="form-input"
              placeholder="https://..."
            />
          </div>
          <button
            v-if="socialLinks.length > 1"
            @click.prevent="socialLinks.splice(index, 1)"
            type="button"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Remove
          </button>
        </div>

        <button
          type="button"
          @click.prevent="socialLinks.push({ platform: '', url: '' })"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
        >
          + Add Social Link
        </button>

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
          {{ loading ? "Saving..." : "Save Social Links" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiService } from "../services/api.service";

const activeTab = ref<"hero" | "about" | "skills" | "social">("hero");
const tabs = ["hero", "about", "skills", "social"] as const;
const tabLabels = {
  hero: "Hero Section",
  about: "About Section",
  skills: "Skills",
  social: "Social Links",
};

const loading = ref(false);
const error = ref("");

const heroData = ref({
  heroTitle: "",
  heroTagline: "",
  heroImage: "",
});

const aboutData = ref({
  aboutDescription: "",
  aboutImage: "",
  aboutImageAlt: "",
});

const skillsData = ref<
  Array<{ category: string; items: string[]; itemsText: string }>
>([{ category: "", items: [], itemsText: "" }]);

const socialLinks = ref<Array<{ platform: string; url: string }>>([
  { platform: "", url: "" },
]);

const loadContent = async () => {
  try {
    const [heroRes, aboutRes, skillsRes] = await Promise.all([
      apiService.getContent("hero"),
      apiService.getContent("about"),
      apiService.getContent("skills"),
    ]);

    if (heroRes.success && heroRes.data) {
      heroData.value = {
        heroTitle: heroRes.data.heroTitle || "",
        heroTagline: heroRes.data.heroTagline || "",
        heroImage: heroRes.data.heroImage || "",
      };
    }

    if (aboutRes.success && aboutRes.data) {
      aboutData.value = {
        aboutDescription: aboutRes.data.aboutDescription || "",
        aboutImage: aboutRes.data.aboutImage || "",
        aboutImageAlt: aboutRes.data.aboutImageAlt || "",
      };
    }

    if (skillsRes.success && skillsRes.data) {
      if (Array.isArray(skillsRes.data.skills)) {
        skillsData.value = skillsRes.data.skills.map((s: any) => ({
          category: s.category,
          items: s.items || [],
          itemsText: (s.items || []).join(", "),
        }));
      }
      if (Array.isArray(skillsRes.data.socialLinks)) {
        socialLinks.value = skillsRes.data.socialLinks;
      }
    }
  } catch (error) {
    console.error("Error loading content:", error);
  }
};

const submitHero = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await apiService.updateContent("hero", heroData.value);
    if (response.success) {
      error.value = "";
    } else {
      error.value = response.message || "Failed to update hero section";
    }
  } catch (err) {
    error.value = "An error occurred while updating the hero section";
  } finally {
    loading.value = false;
  }
};

const submitAbout = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await apiService.updateContent("about", aboutData.value);
    if (response.success) {
      error.value = "";
    } else {
      error.value = response.message || "Failed to update about section";
    }
  } catch (err) {
    error.value = "An error occurred while updating the about section";
  } finally {
    loading.value = false;
  }
};

const submitSkills = async () => {
  loading.value = true;
  error.value = "";

  try {
    const skills = skillsData.value.map((s) => ({
      category: s.category,
      items: s.items,
    }));

    const response = await apiService.updateContent("skills", {
      skills,
      socialLinks: socialLinks.value,
    });

    if (response.success) {
      error.value = "";
    } else {
      error.value = response.message || "Failed to update skills";
    }
  } catch (err) {
    error.value = "An error occurred while updating the skills";
  } finally {
    loading.value = false;
  }
};

const submitSocial = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await apiService.updateContent("skills", {
      socialLinks: socialLinks.value,
    });

    if (response.success) {
      error.value = "";
    } else {
      error.value = response.message || "Failed to update social links";
    }
  } catch (err) {
    error.value = "An error occurred while updating the social links";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadContent();
});
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400;
}
</style>
