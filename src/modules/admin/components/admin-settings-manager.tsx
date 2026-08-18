"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/modules/admin/components/admin-shell";
import {
  getAdminStoreSettingsPreview,
  saveAdminStoreSettingsPreview,
} from "@/modules/admin/mock-transport";
import { adminStoreSettingsSchema, type AdminStoreSettingsValues } from "@/modules/admin/schemas";

const EMPTY_SETTINGS: AdminStoreSettingsValues = {
  name: "",
  description: "",
  phone: "",
  email: "",
  workingHours: "",
  address: "",
  instagram: "",
  pinterest: "",
  telegram: "",
};

export function AdminSettingsManager() {
  const [loading, setLoading] = useState(true);
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
    defaultValues: EMPTY_SETTINGS,
  });

  async function loadSettings() {
    setLoading(true);
    setLoadError("");
    try {
      reset(await getAdminStoreSettingsPreview());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Не удалось загрузить настройки.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminStoreSettingsPreview().then(
      (settings) => {
        if (active) {
          reset(settings);
          setLoading(false);
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить настройки.");
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [reset]);

  const submit = handleSubmit(async (values) => {
    setSubmitError("");
    setSaved(false);
    try {
      reset(await saveAdminStoreSettingsPreview(values));
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
          <span className="admin-dashboard__preview">Демонстрационные данные</span>
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
