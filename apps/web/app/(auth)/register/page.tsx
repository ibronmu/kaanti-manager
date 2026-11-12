"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { api, ApiError } from "@/app/lib/api";
import { useState } from "react";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  phone: z.string().min(7).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await api.post("/auth/register", { ...values, phone: values.phone || undefined });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  };

  if (success) {
    return <div className="card p-6 text-center text-navy">Account created. Redirecting to login…</div>;
  }

  return (
    <div className="card p-6">
      <h1 className="mb-1 text-2xl font-semibold text-navy">Create your account</h1>
      <p className="mb-6 text-sm text-navy/60">Start managing your business today.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" {...register("fullName")} className="input" />
          {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} className="input" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone (optional)</label>
          <input id="phone" {...register("phone")} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} className="input" />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        {serverError && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{serverError}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-navy/60">
        Already registered? <Link href="/login" className="font-medium text-emerald">Log in</Link>
      </p>
    </div>
  );
}