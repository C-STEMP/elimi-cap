import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email address is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character");

export const confirmPasswordSchema = (password: string) =>
  z
    .string()
    .min(1, "Confirm password is required")
    .refine((val) => val === password, {
      message: "Passwords do not match",
    });

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (val) => {
      const clean = val.replace(/[\s\-\+]/g, "");
      return /^\d{7,15}$/.test(clean);
    },
    { message: "Please enter a valid phone number" }
  );

export const ninSchema = z
  .string()
  .min(1, "NIN is required")
  .regex(/^\d{11}$/, "NIN must be an 11-digit number");

export function requiredSchema(fieldName: string = "This field") {
  return z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((val) => val.trim().length > 0, {
      message: `${fieldName} is required`,
    });
}

export function formatToIsoDate(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else if (parts[2].length === 4) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      let day = parts[0];
      let month = parts[1];
      if (p0 <= 12 && p1 > 12) {
        month = parts[0];
        day = parts[1];
      }
      return `${parts[2]}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else if (parts[2].length === 2) {
      const day = parts[0];
      const month = parts[1];
      let yearNum = parseInt(parts[2], 10);
      if (!isNaN(yearNum)) {
        yearNum += yearNum < 40 ? 2000 : 1900;
      }
      return `${yearNum}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return trimmed;
}

// Zod Schemas for Full Forms
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const completeSignUpSchema = z
  .object({
    fullName: requiredSchema("Full name"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const startApplicationSchema = z.object({
  assessmentCenter: requiredSchema("Assessment centre"),
  sector: requiredSchema("Sector"),
  trade: requiredSchema("Trade"),
});


export const dobSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine(
    (val) => {
      if (!val || typeof val !== "string") return false;
      const iso = formatToIsoDate(val);
      if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
      const [yearStr, monthStr, dayStr] = iso.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);

      const dobDate = new Date(year, month, day);
      if (
        dobDate.getFullYear() !== year ||
        dobDate.getMonth() !== month ||
        dobDate.getDate() !== day
      ) {
        return false;
      }

      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }

      return age >= 18;
    },
    { message: "Applicant must be 18 years or older" },
  );

export const personalInfoSchema = z.object({
  firstName: requiredSchema("First name"),
  lastName: requiredSchema("Last name"),
  dob: dobSchema,
  gender: requiredSchema("Gender"),
  nationality: requiredSchema("Nationality"),
  email: emailSchema,
  phoneNumber: phoneSchema,
  country: requiredSchema("Country"),
  state: requiredSchema("State of residence"),
  lga: requiredSchema("City / LGA"),
  streetAddress: requiredSchema("Residential address"),
  impairment: requiredSchema("Accessibility selection"),
});

export const rplExperienceTradeSchema = z.object({
  qualificationTitle: requiredSchema("Qualification title"),
  assessmentType: requiredSchema("Assessment type"),
  occupation: requiredSchema("Occupation"),
  yearsOfExperience: requiredSchema("Years of experience"),
});

export const selfAssessmentStep1Schema = z.object({
  firstName: requiredSchema("First name"),
  lastName: requiredSchema("Last name"),
  middleName: z.string().optional(),
  dob: dobSchema,
  email: emailSchema,
  phone: phoneSchema,
  state: requiredSchema("State of residence"),
  lga: requiredSchema("Local Government Area"),
  address: requiredSchema("Residential address"),
});


// Helper function to extract field errors from a Zod safeParse result
export function extractZodErrors(
  result: { success: boolean; error?: z.ZodError }
): Record<string, string> {
  if (result.success || !result.error) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key !== undefined && typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

// Validation helper functions powered by Zod schemas
export function validateEmail(email: string): string | null {
  const res = emailSchema.safeParse(email);
  return res.success ? null : res.error.issues[0]?.message || "Invalid email";
}

export function validatePassword(password: string): string | null {
  const res = passwordSchema.safeParse(password);
  return res.success ? null : res.error.issues[0]?.message || "Invalid password";
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  const res = confirmPasswordSchema(password).safeParse(confirmPassword);
  return res.success ? null : res.error.issues[0]?.message || "Passwords do not match";
}

export function validateRequired(value: string, fieldName: string = "This field"): string | null {
  const res = requiredSchema(fieldName).safeParse(value);
  return res.success ? null : res.error.issues[0]?.message || `${fieldName} is required`;
}

export function validatePhone(phone: string): string | null {
  const res = phoneSchema.safeParse(phone);
  return res.success ? null : res.error.issues[0]?.message || "Invalid phone number";
}

export function validateNIN(nin: string): string | null {
  const res = ninSchema.safeParse(nin);
  return res.success ? null : res.error.issues[0]?.message || "Invalid NIN";
}

export interface PasswordCriterion {
  id: string;
  label: string;
  isValid: boolean;
}

export function getPasswordCriteria(password: string): PasswordCriterion[] {
  return [
    {
      id: "length",
      label: "At least 8 characters long",
      isValid: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "One uppercase letter (A-Z)",
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter (a-z)",
      isValid: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "One number (0-9)",
      isValid: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "One special character (e.g. !, @, #, -, etc.)",
      isValid: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

