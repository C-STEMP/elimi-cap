export type SettingsTab = "profile" | "security";

export type VerificationStatus = "verified" | "not_verified";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  email: string;
  phone: string;
  stateOfResidence: string;
  lga: string;
  residentialAddress: string;
  impairment: string;
  emailNotifications: boolean;
  sessionReminders: boolean;
}

export interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
