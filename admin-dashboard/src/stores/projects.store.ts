import { defineStore } from "pinia";
import { ref } from "vue";
import { Project } from "../types";
import { apiService } from "../services/api.service";

export const useProjectsStore = defineStore("projects", () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);

  const fetchProjects = async (
    published?: boolean,
    skip?: number,
    limit?: number,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.getProjects(published, skip, limit);
      if (response.success && response.data) {
        projects.value = response.data.data;
        total.value = response.data.total;
      } else {
        error.value = response.message || "Failed to fetch projects";
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch projects";
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (
    projectData: Omit<Project, "_id" | "createdAt" | "updatedAt">,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.createProject(projectData);
      if (response.success && response.data) {
        projects.value.unshift(response.data);
        return response.data;
      } else {
        error.value = response.message || "Failed to create project";
        throw new Error(error.value);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to create project";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.updateProject(id, projectData);
      if (response.success && response.data) {
        const index = projects.value.findIndex((p) => p._id === id);
        if (index >= 0) {
          projects.value[index] = response.data;
        }
        return response.data;
      } else {
        error.value = response.message || "Failed to update project";
        throw new Error(error.value);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to update project";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProject = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.deleteProject(id);
      if (response.success) {
        projects.value = projects.value.filter((p) => p._id !== id);
      } else {
        error.value = response.message || "Failed to delete project";
        throw new Error(error.value);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to delete project";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const togglePublish = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.toggleProjectPublish(id);
      if (response.success && response.data) {
        const index = projects.value.findIndex((p) => p._id === id);
        if (index >= 0) {
          projects.value[index] = response.data;
        }
        return response.data;
      } else {
        error.value = response.message || "Failed to toggle publish";
        throw new Error(error.value);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to toggle publish";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reorder = async (projectIds: Array<{ id: string; order: number }>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.reorderProjects(projectIds);
      if (response.success) {
        await fetchProjects();
      } else {
        error.value = response.message || "Failed to reorder projects";
        throw new Error(error.value);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to reorder projects";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    projects,
    loading,
    error,
    total,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    togglePublish,
    reorder,
  };
});
