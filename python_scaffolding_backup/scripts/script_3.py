# Create TypeScript types and interfaces
def create_types():
    
    # src/types/index.ts - Main types file
    main_types = '''export interface User {
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
'''
    
    # src/types/api.ts - API-specific types
    api_types = '''import { NextApiRequest } from 'next';
import { User } from './index';

export interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

export interface AuthTokenPayload {
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export interface DatabaseBook {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  published_date?: string | null;
  description?: string | null;
  page_count?: number | null;
  categories?: string | null; // JSON string
  image_url?: string | null;
  available: boolean;
  google_books_id?: string | null;
  goodreads_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  avatar?: string | null;
  permissions?: string | null; // JSON string
}

export interface DatabaseRequest {
  id: string;
  book_id: string;
  user_id: string;
  status: string;
  requested_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
  approved_by?: string | null;
}

export interface DatabaseSettings {
  id: string;
  key: string;
  value: string; // JSON string
  updated_at: string;
}
'''
    
    # src/types/components.ts - Component prop types
    component_types = '''import { ReactNode } from 'react';
import { Book, BookRequest, User } from './index';

export interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export interface BookCardProps {
  book: Book;
  onRequest?: (bookId: string) => void;
  onView?: (book: Book) => void;
  showActions?: boolean;
}

export interface RequestCardProps {
  request: BookRequest;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string, reason?: string) => void;
  showActions?: boolean;
}

export interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  showActions?: boolean;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: (query: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
'''
    
    # Write type files
    with open("bookseerr/src/types/index.ts", "w") as f:
        f.write(main_types)
    
    with open("bookseerr/src/types/api.ts", "w") as f:
        f.write(api_types)
    
    with open("bookseerr/src/types/components.ts", "w") as f:
        f.write(component_types)
    
    return "TypeScript types created"

print(create_types())