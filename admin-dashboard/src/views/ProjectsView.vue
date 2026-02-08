<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-bold text-white mb-2">Projects</h1>
        <p class="text-slate-400">Manage your portfolio projects</p>
      </div>
      <button
        @click="showForm = true"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
      >
        + New Project
      </button>
    </div>

    <!-- Create/Edit Form -->
    <div
      v-if="showForm"
      class="bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">
          {{ editingProject ? "Edit Project" : "Create New Project" }}
        </h2>
        <button
          @click="closeForm"
          class="text-slate-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      <form @submit.prevent="submitProject" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-2"
              >Title</label
            >
            <input
              v-model="formData.title"
              type="text"
              required
              class="form-input"
              placeholder="Project title"
            />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-2">
              Preview Color
            </label>
            <input
              v-model="formData.previewColor"
              type="color"
              class="form-input h-10"
            />
          </div>
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            v-model="formData.description"
            class="form-input h-24"
            placeholder="Short description"
          />
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Full Description
          </label>
          <textarea
            v-model="formData.fullDescription"
            class="form-input h-32"
            placeholder="Detailed description"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-2">
              External Link
            </label>
            <input
              v-model="formData.externalLink"
              type="url"
              class="form-input"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-2">
              GitHub Link
            </label>
            <input
              v-model="formData.githubLink"
              type="url"
              class="form-input"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-2">
              Demo Link
            </label>
            <input
              v-model="formData.demoLink"
              type="url"
              class="form-input"
              placeholder="https://demo.example.com"
            />
          </div>
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-2">
            Technologies (comma-separated)
          </label>
          <input
            v-model="techInput"
            type="text"
            class="form-input"
            placeholder="Vue, Node.js, MongoDB"
          />
          <div class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="(tech, index) in formData.technologies"
              :key="index"
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-2"
            >
              {{ tech }}
              <button
                @click.prevent="formData.technologies.splice(index, 1)"
                class="hover:text-red-300"
              >
                ×
              </button>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="formData.isPublished"
            type="checkbox"
            id="published"
            class="w-4 h-4"
          />
          <label for="published" class="text-slate-300 text-sm">
            Publish this project
          </label>
        </div>

        <div
          v-if="error"
          class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
        >
          {{ error }}
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {{
              loading
                ? "Saving..."
                : editingProject
                  ? "Update Project"
                  : "Create Project"
            }}
          </button>
          <button
            type="button"
            @click="closeForm"
            class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Projects List -->
    <div v-if="projects.length > 0" class="grid gap-4">
      <div
        v-for="project in projects"
        :key="project._id"
        class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded"
                :style="{ backgroundColor: project.previewColor }"
              />
              <h3 class="text-xl font-bold text-white">{{ project.title }}</h3>
              <span
                v-if="project.isPublished"
                class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded"
              >
                Published
              </span>
              <span
                v-else
                class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded"
              >
                Draft
              </span>
            </div>
            <p class="text-slate-400 mt-2">{{ project.description }}</p>
          </div>
          <div class="ml-4 flex gap-2">
            <button
              @click="editProject(project)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              @click="deleteProject(project._id)"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tech in project.technologies"
            :key="tech"
            class="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
          >
            {{ tech }}
          </span>
        </div>

        <div class="flex gap-2">
          <a
            v-if="project.externalLink"
            :href="project.externalLink"
            target="_blank"
            class="text-sm text-blue-400 hover:text-blue-300"
          >
            External Link
          </a>
          <a
            v-if="project.githubLink"
            :href="project.githubLink"
            target="_blank"
            class="text-sm text-blue-400 hover:text-blue-300"
          >
            GitHub
          </a>
          <a
            v-if="project.demoLink"
            :href="project.demoLink"
            target="_blank"
            class="text-sm text-blue-400 hover:text-blue-300"
          >
            Demo
          </a>
        </div>
      </div>
    </div>
    <div
      v-else
      class="text-center py-12 bg-slate-800 rounded-lg border border-slate-700"
    >
      <p class="text-slate-400">No projects yet. Create one to get started!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiService } from "../services/api.service";
import type { Project } from "../types";

const projects = ref<Project[]>([]);
const showForm = ref(false);
const editingProject = ref<Project | null>(null);
const loading = ref(false);
const error = ref("");
const techInput = ref("");

const formData = ref({
  title: "",
  description: "",
  fullDescription: "",
  technologies: [] as string[],
  previewColor: "#3b82f6",
  externalLink: "",
  githubLink: "",
  demoLink: "",
  isPublished: false,
});

const loadProjects = async () => {
  try {
    const response = await apiService.getProjects();
    if (response.success && response.data) {
      projects.value = Array.isArray(response.data) ? response.data : [];
    }
  } catch (error) {
    console.error("Error loading projects:", error);
  }
};

const submitProject = async () => {
  if (techInput.value.trim()) {
    const newTechs = techInput.value.split(",").map((t) => t.trim());
    formData.value.technologies.push(...newTechs);
    techInput.value = "";
  }

  loading.value = true;
  error.value = "";

  try {
    const data = {
      title: formData.value.title,
      description: formData.value.description,
      fullDescription: formData.value.fullDescription,
      technologies: formData.value.technologies,
      previewColor: formData.value.previewColor,
      externalLink: formData.value.externalLink || undefined,
      githubLink: formData.value.githubLink || undefined,
      demoLink: formData.value.demoLink || undefined,
      isPublished: formData.value.isPublished,
    };

    let response;
    if (editingProject.value) {
      response = await apiService.updateProject(editingProject.value._id, data);
    } else {
      response = await apiService.createProject(data);
    }

    if (response.success) {
      closeForm();
      await loadProjects();
    } else {
      error.value = response.message || "Failed to save project";
    }
  } catch (err) {
    error.value = "An error occurred while saving the project";
  } finally {
    loading.value = false;
  }
};

const editProject = (project: Project) => {
  editingProject.value = project;
  formData.value = {
    title: project.title,
    description: project.description,
    fullDescription: project.fullDescription || "",
    technologies: [...project.technologies],
    previewColor: project.previewColor,
    externalLink: project.externalLink || "",
    githubLink: project.githubLink || "",
    demoLink: project.demoLink || "",
    isPublished: project.isPublished,
  };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingProject.value = null;
  formData.value = {
    title: "",
    description: "",
    fullDescription: "",
    technologies: [],
    previewColor: "#3b82f6",
    externalLink: "",
    githubLink: "",
    demoLink: "",
    isPublished: false,
  };
  techInput.value = "";
  error.value = "";
};

const deleteProject = async (id: string) => {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      const response = await apiService.deleteProject(id);
      if (response.success) {
        await loadProjects();
      } else {
        error.value = response.message || "Failed to delete project";
      }
    } catch (err) {
      error.value = "An error occurred while deleting the project";
    }
  }
};

onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400;
}
</style>
