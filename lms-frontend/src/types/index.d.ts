export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'ADMIN_LIBRARY' | 'ADMIN_UNIFORMS' | 'ADMIN_STATIONERY';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  rollNumber: string;
  admissionDate: string;
  courseId: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}