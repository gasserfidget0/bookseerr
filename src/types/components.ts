import { ReactNode } from 'react';
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
