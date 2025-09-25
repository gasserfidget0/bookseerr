export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  permissions?: UserPermissions;
}

export interface UserPermissions {
  canRequest: boolean;
  canApprove: boolean;
  canManageUsers: boolean;
  canConfigureSettings: boolean;
  maxRequests?: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageUrl?: string;
  available: boolean;
  requested: boolean;
  googleBooksId?: string;
  goodreadsId?: string;
}

export interface BookRequest {
  id: string;
  bookId: string;
  userId: string;
  status: RequestStatus;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  notes?: string;
  rejectionReason?: string;
  approvedBy?: string;
  book?: Book;
  user?: User;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';

export interface ReadarrConfig {
  url: string;
  apiKey: string;
  rootFolder: string;
  qualityProfile: string;
  metadataProfile?: string;
  enabled: boolean;
}

export interface QBittorrentConfig {
  url: string;
  username: string;
  password: string;
  downloadPath?: string;
  category?: string;
  enabled: boolean;
}

export interface AppSettings {
  general: {
    applicationTitle: string;
    applicationUrl: string;
    enableRegistration: boolean;
    defaultPermissions: UserPermissions;
  };
  readarr?: ReadarrConfig;
  qbittorrent?: QBittorrentConfig;
  notifications: {
    email?: EmailConfig;
    discord?: DiscordConfig;
  };
}

export interface EmailConfig {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  fromAddress: string;
}

export interface DiscordConfig {
  enabled: boolean;
  webhookUrl: string;
  enableMentions: boolean;
  botUsername?: string;
  botAvatarUrl?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookSearchParams {
  query?: string;
  author?: string;
  category?: string;
  available?: boolean;
  requested?: boolean;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  pendingRequests: number;
  completedRequests: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'request' | 'approval' | 'completion' | 'user_registration';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

// External API types
export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

export interface ReadarrBook {
  id: number;
  title: string;
  authorName: string;
  isbn?: string;
  overview?: string;
  pageCount?: number;
  genres?: string[];
  images?: Array<{
    coverType: string;
    url: string;
  }>;
  monitored: boolean;
  added: string;
}

export interface QBittorrentTorrent {
  hash: string;
  name: string;
  size: number;
  progress: number;
  state: string;
  category?: string;
  save_path: string;
  completed_on?: number;
  added_on: number;
}

export interface NotificationPayload {
  type: 'request_approved' | 'request_rejected' | 'request_completed' | 'book_available';
  userId: string;
  bookTitle: string;
  message: string;
  data?: any;
}
