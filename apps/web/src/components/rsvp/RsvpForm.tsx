"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { rsvpFormSchema, type RsvpFormValues } from "@/lib/schemas";
import { useRsvpFlow } from "@/state/rsvpFlow";

export function RsvpForm() {
  const setNameNumber = useRsvpFlow((s) => s.setNameNumber);
  const rsvpType = useRsvpFlow((s) => s.rsvp_type);

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
      setNameNumber({ name: values.name.trim(), phone: values.phone.trim() });
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Something went wrong — try again.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Name (Last, First)"
        placeholder="Mario, Super"
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

      {submitError && (
        <p className="text-sm font-semibold text-mario-red">{submitError}</p>
      )}

      <Button
        type="submit"
        variant={rsvpType === "spectator" ? "red" : "green"}
        size="lg"
        disabled={isSubmitting}
        className="mt-2"
      >
        Continue →
      </Button>
    </form>
  );
}
