import type { UserRole } from "./types";

export function canUploadWorkVideo(role: UserRole) {
  return role === "admin" || role === "sub_admin";
}
