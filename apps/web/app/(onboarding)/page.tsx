"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { BUSINESS_CATEGORIES, NIGERIAN_STATES } from "@kaanti/shared";

const schema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  type: z.string().min(2),
  location: z.string().min(2),
  phone: z.string().min(7),
  preferredLanguage: z.enum(["en", "ha"]),
  currency: z.string().default("NGN"),
});
type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { preferredLanguage: "en", currency: "NGN", category: "Retail", type: "Sole Proprietorship", location: "Kano" },
  });

  const onSubmit = async (values: FormValues) => {
    setErr(null);
    try {
      await api.post("/businesses", values);
      router.replace("/dashboard");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Unable to create business");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-navy">Set up your business</h1>
        <p className="mb-6 mt-1 text-sm text-navy/60">Tell us about the business you want to manage.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Business name</label>
            <input id="name" {...register("name")} className="input" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" {...register("category")} className="input">
              {BUSINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="type">Business type</label>
            <select id="type" {...register("type")} className="input">
              {["Sole Proprietorship", "Partnership", "Limited Company", "Cooperative"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="location">State</label>
            <select id="location" {...register("location")} className="input">
              {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="phone">Business phone</label>
            <input id="phone" {...register("phone")} className="input" placeholder="+234…" />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="preferredLanguage">Language</label>
              <select id="preferredLanguage" {...register("preferredLanguage")} className="input">
                <option value="en">English</option>
                <option value="ha">Hausa</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="currency">Currency</label>
              <select id="currency" {...register("currency")} className="input">
                <option value="NGN">NGN (₦)</option>
              </select>
            </div>
          </div>
          {err && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</p>}
          <button disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Creating business…" : "Create business"}
          </button>
        </form>
      </div>
    </div>
  );
}