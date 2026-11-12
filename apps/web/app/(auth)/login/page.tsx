"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { api, ApiError } from "@/app/lib/api";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await api.post("/auth/login", values);
      router.push("/dashboard");
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="card p-6">
      <h1 className="mb-1 text-2xl font-semibold text-navy">Welcome back</h1>
      <p className="mb-6 text-sm text-navy/60">Log in to your Kaanti Manager account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} className="input" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} className="input" />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        {serverError && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{serverError}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-navy/60">
        New here? <Link href="/register" className="font-medium text-emerald">Create an account</Link>
      </p>
    </div>
  );
}