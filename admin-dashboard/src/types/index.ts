export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  fullDescription?: string;
  technologies: string[];
  previewColor: string;
  previewImage?: string;
  externalLink?: string;
  githubLink?: string;
  demoLink?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  repliedAt?: string;
  reply?: string;
  repliedBy?: string;
  submittedAt: string;
}

export interface Content {
  _id: string;
  type: "hero" | "about" | "skills";
  heroTitle?: string;
  heroTagline?: string;
  heroImage?: string;
  aboutDescription?: string;
  aboutImage?: string;
  aboutImageAlt?: string;
  skills?: Array<{
    category: string;
    items: string[];
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  lastModifiedBy?: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
