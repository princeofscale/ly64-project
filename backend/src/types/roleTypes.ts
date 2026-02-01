export interface UserRole {
  readonly role: string;
}

export interface RoleCheckResult {
  readonly isAdmin: boolean;
  readonly role: string;
}
