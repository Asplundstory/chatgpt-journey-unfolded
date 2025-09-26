import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must be less than 128 characters" });

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" });

export const textSchema = z
  .string()
  .trim()
  .max(1000, { message: "Text must be less than 1000 characters" });

// Auth schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Portfolio schemas
export const addPortfolioItemSchema = z.object({
  wine_id: z.string().uuid({ message: "Invalid wine ID" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
  purchase_price: z.number().min(0, { message: "Price must be positive" }),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
  notes: textSchema.optional(),
});

export const updatePortfolioItemSchema = addPortfolioItemSchema.partial().extend({
  id: z.string().uuid({ message: "Invalid portfolio item ID" }),
});

// Utility function to safely validate data
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Validation failed" };
  }
};

// Sanitize HTML content (basic implementation)
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - remove script tags and on* attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};

// URL parameter encoding utility
export const encodeUrlParam = (param: string): string => {
  return encodeURIComponent(param);
};