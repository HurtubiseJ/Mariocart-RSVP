"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api } from "@/lib/api";
import { rsvpFormSchema, type RsvpFormValues } from "@/lib/schemas";
import { useRsvpFlow } from "@/state/rsvpFlow";

export function RsvpForm() {
  const setRsvp = useRsvpFlow((s) => s.setRsvp);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const rsvp = await api.createRsvp({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email && values.email.length > 0 ? values.email : undefined,
      });
      setRsvp(rsvp);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Something went wrong — try again.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Name"
        placeholder="Mario"
        autoComplete="name"
        {...register("name")}
        error={errors.name?.message}
      />
      <Field
        label="Phone"
        type="tel"
        inputMode="tel"
        placeholder="(555) 010-1234"
        autoComplete="tel"
        hint="For game day details and updates"
        {...register("phone")}
        error={errors.phone?.message}
      />
      {/* <Field
        label="Email (optional)"
        type="email"
        inputMode="email"
        placeholder="mario@beerio.gg"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      /> */}

      {submitError && (
        <p className="text-sm font-semibold text-mario-red">{submitError}</p>
      )}

      <Button
        type="submit"
        variant="red"
        size="lg"
        disabled={isSubmitting}
        className="mt-2"
      >
        {isSubmitting ? "Saving…" : "Confirm & Play 🏁"}
      </Button>
    </form>
  );
}
