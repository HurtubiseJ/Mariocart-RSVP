"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { TextareaField } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import { unrsvpFormSchema, type UnrsvpFormValues } from "@/lib/schemas";

export function UnrsvpForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UnrsvpFormValues>({
    resolver: zodResolver(unrsvpFormSchema),
    defaultValues: { name: "", phone: "", reason: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await api.unrsvp({
        name: values.name.trim(),
        phone: values.phone.trim(),
        reason: values.reason.trim(),
      });
      setDone(true);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Something went wrong — try again.",
      );
    }
  });

  if (done) {
    return (
      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="font-display text-2xl text-ink">You&apos;re withdrawn.</p>
        <p className="text-ink/70">
          Sorry to see you go — your spot has been released. You can RSVP again
          any time before race day.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <TransitionLink href="/rsvp" className={buttonClasses("red", "lg")}>
            RSVP again 🏁
          </TransitionLink>
          <TransitionLink href="/" className={buttonClasses("outline", "lg")}>
            Back home
          </TransitionLink>
        </div>
      </Card>
    );
  }

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
        hint="We use this to find your RSVP"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <TextareaField
        label="Why can't you make it?"
        placeholder="Tell us a little about why you're no longer attending (at least a few sentences)."
        hint="At least 3 sentences"
        {...register("reason")}
        error={errors.reason?.message}
      />

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
        {isSubmitting ? "Withdrawing…" : "Withdraw my RSVP"}
      </Button>
    </form>
  );
}
