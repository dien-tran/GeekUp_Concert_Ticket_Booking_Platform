// ===== Admin Types =====
export interface AdminPermission {
  name: string;
  description: string;
}

export interface AdminRole {
  name: string;
  description: string;
  permissions: AdminPermission[];
}

export interface AdminRoleCreateRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface AdminRoleUpdateRequest {
  description: string;
  permissions: string[];
}

export interface AdminPermissionCreateRequest {
  name: string;
  description: string;
}

export interface AdminPermissionUpdateRequest {
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: AdminRole[];
}

export interface AdminUserUpdateRequest {
  name: string;
  password?: string;
  phone: string;
  roles: string[];
}
