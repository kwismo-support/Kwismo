/**
 * Types génériques pour les échanges avec l'API.
 */

export interface ApiError {
  message:  string;
  status:   number;
  detail?:  string;
}

export interface Paginated<T> {
  items:   T[];
  total:   number;
  page:    number;
  size:    number;
  pages:   number;
}

export interface PaginationParams {
  page?:    number;
  size?:    number;
  search?:  string;
  sort?:    string;
  order?:   'asc' | 'desc';
}

export interface ApiResponse<T> {
  data:    T;
  message: string;
}
