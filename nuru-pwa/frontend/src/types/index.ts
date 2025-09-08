// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

// Client types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billingDetails?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  sites?: Site[];
}

// Site types
export interface Site {
  id: string;
  projectId: string;
  name: string;
  serviceType: ServiceType;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  workerTypes?: WorkerType[];
}

export enum ServiceType {
  WAREHOUSE = 'WAREHOUSE',
  CARGO = 'CARGO',
  FERTILIZER = 'FERTILIZER',
  EQUIPMENT = 'EQUIPMENT',
  TRANSPORT = 'TRANSPORT',
  MANPOWER = 'MANPOWER',
}

// Worker types
export interface WorkerType {
  id: string;
  siteId: string;
  name: string;
  dailyRate: number;
  overtimeMultiplier: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  site?: Site;
}

// Daily report types
export interface DailyReport {
  id: string;
  supervisorId: string;
  siteId: string;
  workDate: string;
  submittedAt: string;
  lockedAt?: string;
  totalAmount: number;
  notes?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  supervisor?: User;
  site?: Site;
  workerEntries?: WorkerEntry[];
  invoices?: Invoice[];
}

// Worker entry types
export interface WorkerEntry {
  id: string;
  dailyReportId: string;
  workerTypeId: string;
  count: number;
  hours: number;
  overtimeHours: number;
  productionMetrics?: Record<string, any>;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  dailyReport?: DailyReport;
  workerType?: WorkerType;
}

// Invoice types
export interface Invoice {
  id: string;
  dailyReportId: string;
  type: InvoiceType;
  referenceId: string;
  amount: number;
  generatedAt: string;
  pdfPath?: string;
  status: InvoiceStatus;
  clientData?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  dailyReport?: DailyReport;
}

export enum InvoiceType {
  CLIENT = 'CLIENT',
  INTERNAL = 'INTERNAL',
}

export enum InvoiceStatus {
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

// Authentication types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: Record<string, any>;
}

// Offline sync types
export interface SyncQueueItem {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId?: string;
  data: Record<string, any>;
  timestamp: number;
}

export enum SyncStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}