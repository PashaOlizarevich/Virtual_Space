"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/modules/admin/components/admin-shell";
import { loadAdminSettingsAction, saveAdminSettingsAction } from "@/modules/admin/server/actions";
import { adminStoreSettingsSchema, type AdminStoreSettingsValues } from "@/modules/admin/schemas";
import type { PublicStoreSettingsDto } from "@/modules/settings/server/dto";

function toFormValues(settings: PublicStoreSettingsDto): AdminStoreSettingsValues {
  const contact = (label: string) =>
    settings.contacts.find((item) => item.label === label)?.value ?? "";
  const social = (label: string) =>
    settings.socials.find((item) => item.label === label)?.href ?? "";
  return {
    name: settings.name,
    description: settings.description,
    phone: contact("Телефон"),
    email: contact("Почта"),
    workingHours: contact("Часы работы"),
    address: contact("Шоурум"),
    instagram: social("Instagram"),
    pinterest: social("Pinterest"),
    telegram: social("Telegram"),
  };
}

function toSettingsDto(values: AdminStoreSettingsValues): PublicStoreSettingsDto {
  return {
    name: values.name,
    description: values.description,
    contacts: [
      { label: "Шоурум", value: values.address },
      { label: "Телефон", value: values.phone, href: `tel:${values.phone.replace(/[^+\d]/g, "")}` },
      { label: "Почта", value: values.email, href: `mailto:${values.email}` },
      { label: "Часы работы", value: values.workingHours },
    ],
    socials: [
      ["Instagram", values.instagram],
      ["Pinterest", values.pinterest],
      ["Telegram", values.telegram],
    ].flatMap(([label, href]) => (href ? [{ label, href }] : [])),
  };
}

export function AdminSettingsManager({
  initialSettings,
}: {
  initialSettings: PublicStoreSettingsDto;
}) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AdminStoreSettingsValues>({
    resolver: zodResolver(adminStoreSettingsSchema),
    defaultValues: toFormValues(initialSettings),
  });

  async function loadSettings() {
    setLoading(true);
    setLoadError("");
    try {
      reset(toFormValues(await loadAdminSettingsAction()));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Не удалось загрузить настройки.");
    } finally {
      setLoading(false);
    }
  }

  const submit = handleSubmit(async (values) => {
    setSubmitError("");
    setSaved(false);
    try {
      reset(toFormValues(await saveAdminSettingsAction(toSettingsDto(values))));
      setSaved(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось сохранить настройки.");
    }
  });

  return (
    <AdminShell active="settings">
      <main className="admin-dashboard admin-settings">
        <header className="admin-dashboard__header">
          <div>
            <p className="text-label-caps text-secondary">Магазин</p>
            <h1>Настройки</h1>
            <p>Редактируйте информацию, которую покупатели видят на публичных страницах.</p>
          </div>
        </header>

        {loading ? (
          <section className="admin-products__state" aria-busy="true" aria-live="polite">
            <p>Загружаем настройки…</p>
          </section>
        ) : null}
        {loadError ? (
          <section className="admin-products__state" role="alert">
            <h2>Не удалось загрузить настройки</h2>
            <p>{loadError}</p>
            <Button variant="secondary" onClick={() => void loadSettings()}>
              Повторить
            </Button>
          </section>
        ) : null}
        {!loading && !loadError ? (
          <form className="admin-settings__form" onSubmit={submit} noValidate>
            <section className="admin-settings__section" aria-labelledby="settings-general">
              <div>
                <h2 id="settings-general">Основная информация</h2>
                <p>Название и краткое описание магазина.</p>
              </div>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="settings-name">Название</FieldLabel>
                  <Input
                    id="settings-name"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                  {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
                </Field>
                <Field data-invalid={Boolean(errors.description)}>
                  <FieldLabel htmlFor="settings-description">Описание</FieldLabel>
                  <Textarea
                    id="settings-description"
                    aria-invalid={Boolean(errors.description)}
                    {...register("description")}
                  />
                  {errors.description ? (
                    <FieldError>{errors.description.message}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </section>

            <section className="admin-settings__section" aria-labelledby="settings-contacts">
              <div>
                <h2 id="settings-contacts">Контакты и адрес</h2>
                <p>Данные для связи и посещения шоурума.</p>
              </div>
              <FieldGroup>
                <div className="admin-settings__row">
                  <Field data-invalid={Boolean(errors.phone)}>
                    <FieldLabel htmlFor="settings-phone">Телефон</FieldLabel>
                    <Input
                      id="settings-phone"
                      type="tel"
                      aria-invalid={Boolean(errors.phone)}
                      {...register("phone")}
                    />
                    {errors.phone ? <FieldError>{errors.phone.message}</FieldError> : null}
                  </Field>
                  <Field data-invalid={Boolean(errors.email)}>
                    <FieldLabel htmlFor="settings-email">Почта</FieldLabel>
                    <Input
                      id="settings-email"
                      type="email"
                      aria-invalid={Boolean(errors.email)}
                      {...register("email")}
                    />
                    {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
                  </Field>
                </div>
                <Field data-invalid={Boolean(errors.address)}>
                  <FieldLabel htmlFor="settings-address">Адрес</FieldLabel>
                  <Input
                    id="settings-address"
                    aria-invalid={Boolean(errors.address)}
                    {...register("address")}
                  />
                  {errors.address ? <FieldError>{errors.address.message}</FieldError> : null}
                </Field>
                <Field data-invalid={Boolean(errors.workingHours)}>
                  <FieldLabel htmlFor="settings-hours">Часы работы</FieldLabel>
                  <Input
                    id="settings-hours"
                    aria-invalid={Boolean(errors.workingHours)}
                    {...register("workingHours")}
                  />
                  {errors.workingHours ? (
                    <FieldError>{errors.workingHours.message}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </section>

            <section className="admin-settings__section" aria-labelledby="settings-socials">
              <div>
                <h2 id="settings-socials">Социальные сети</h2>
                <p>Оставьте поле пустым, если ссылка не должна отображаться.</p>
              </div>
              <FieldGroup>
                {(["instagram", "pinterest", "telegram"] as const).map((social) => {
                  const label = {
                    instagram: "Instagram",
                    pinterest: "Pinterest",
                    telegram: "Telegram",
                  }[social];
                  return (
                    <Field key={social} data-invalid={Boolean(errors[social])}>
                      <FieldLabel htmlFor={`settings-${social}`}>{label}</FieldLabel>
                      <Input
                        id={`settings-${social}`}
                        type="url"
                        placeholder="https://"
                        aria-invalid={Boolean(errors[social])}
                        {...register(social)}
                      />
                      {errors[social] ? <FieldError>{errors[social]?.message}</FieldError> : null}
                    </Field>
                  );
                })}
                <FieldDescription>Используйте полные публичные ссылки.</FieldDescription>
              </FieldGroup>
            </section>

            <div className="admin-settings__actions">
              <p role={submitError ? "alert" : "status"} aria-live="polite">
                {submitError || (saved ? "Настройки сохранены." : "")}
              </p>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Сохраняем…" : "Сохранить настройки"}
              </Button>
            </div>
          </form>
        ) : null}
      </main>
    </AdminShell>
  );
}
