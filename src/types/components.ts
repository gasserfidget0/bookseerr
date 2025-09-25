import { ReactNode } from 'react';
import { Book, BookRequest, User } from './index';

export interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export interface BookCardProps {
  book: Book;
  onDownload?: (book: Book) => void;
  onRemove?: (book: Book) => void;
}

export interface BookRequestCardProps {
  request: BookRequest;
  onApprove?: (request: BookRequest) => void;
  onReject?: (request: BookRequest) => void;
}

export interface UserProfileProps {
  user: User;
  onUpdate?: (user: Partial<User>) => void;
}

export interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
