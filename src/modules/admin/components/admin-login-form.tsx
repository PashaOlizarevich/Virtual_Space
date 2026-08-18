"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { submitAdminLoginPreview } from "@/modules/admin/mock-transport";
import { adminLoginSchema, type AdminLoginValues } from "@/modules/admin/schemas";
import { useAdminPreviewSession } from "@/modules/admin/session-provider";

export function AdminLoginForm() {
  const session = useAdminPreviewSession();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { login: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await submitAdminLoginPreview(values);
      session.signIn();
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : "Не удалось выполнить вход.");
    }
  });

  return (
    <main className="admin-login">
      <section className="admin-login__panel" aria-labelledby="admin-login-title">
        <div className="admin-login__mark" aria-hidden="true">
          <LockKeyhole />
        </div>
        <div className="admin-login__heading">
          <p className="text-label-caps text-secondary">Панель управления</p>
          <h1 id="admin-login-title">Вход администратора</h1>
          <p>
            Используйте административную учётную запись. На текущем этапе форма работает только в
            демонстрационном режиме.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.login)}>
              <FieldLabel htmlFor="admin-login">Логин</FieldLabel>
              <Input
                id="admin-login"
                type="text"
                autoComplete="username"
                placeholder="admin"
                aria-invalid={Boolean(form.formState.errors.login)}
                aria-describedby={form.formState.errors.login ? "admin-login-error" : undefined}
                {...form.register("login")}
              />
              {form.formState.errors.login ? (
                <FieldError id="admin-login-error">
                  {form.formState.errors.login.message}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel htmlFor="admin-password">Пароль</FieldLabel>
              <div className="admin-login__password">
                <Input
                  id="admin-password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  aria-describedby={
                    form.formState.errors.password ? "admin-password-error" : undefined
                  }
                  {...form.register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={passwordVisible ? "Скрыть пароль" : "Показать пароль"}
                >
                  {passwordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </Button>
              </div>
              {form.formState.errors.password ? (
                <FieldError id="admin-password-error">
                  {form.formState.errors.password.message}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <Button
            className="admin-login__submit"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <LoaderCircle data-icon="inline-start" aria-hidden="true" />
                Проверяем…
              </>
            ) : (
              "Войти в Dashboard"
            )}
          </Button>
          {submitError ? (
            <p className="admin-login__error" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
