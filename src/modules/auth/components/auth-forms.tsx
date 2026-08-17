"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { submitAuthPreview, type AuthMode } from "@/modules/auth/mock-transport";
import {
  loginSchema,
  recoverySchema,
  registrationSchema,
  type LoginValues,
  type RecoveryValues,
  type RegistrationValues,
} from "@/modules/auth/schemas";

const modes: { id: AuthMode; label: string }[] = [
  { id: "login", label: "Вход" },
  { id: "registration", label: "Регистрация" },
  { id: "recovery", label: "Восстановление" },
];

function PasswordField({
  registered,
  autoComplete,
  error,
}: {
  registered: UseFormRegisterReturn<"password">;
  autoComplete: "current-password" | "new-password";
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field>
      <FieldLabel htmlFor="password">Пароль</FieldLabel>
      <div className="auth-form__password">
        <Input
          id="password"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "password-error" : undefined}
          {...registered}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error ? <FieldError id="password-error">{error}</FieldError> : null}
    </Field>
  );
}

function Status({ value }: { value: string | null }) {
  return value ? (
    <p className="auth-form__status" role="status">
      {value}
    </p>
  ) : null;
}

function LoginForm({ onMode }: { onMode: (mode: AuthMode) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = form.handleSubmit(async () => {
    setError(null);
    try {
      await submitAuthPreview("login");
      setStatus("Данные формы проверены. Реальный вход будет доступен после подключения Auth.js.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось обработать форму.");
    }
  });
  return (
    <AuthFormShell
      title="Войти в аккаунт"
      description="Доступ к профилю и истории заказов появится после подключения авторизации."
    >
      <form onSubmit={submit} noValidate>
        <FieldGroup>
          <EmailField
            registered={form.register("email")}
            error={form.formState.errors.email?.message}
          />
          <PasswordField
            registered={form.register("password")}
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
          />
        </FieldGroup>
        <button className="auth-form__text-action" type="button" onClick={() => onMode("recovery")}>
          Забыли пароль?
        </button>
        <SubmitButton pending={form.formState.isSubmitting}>Войти</SubmitButton>
        {error ? (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        ) : null}
        <Status value={status} />
      </form>
    </AuthFormShell>
  );
}

function RegistrationForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  return (
    <AuthFormShell
      title="Создать аккаунт"
      description="Сохраните данные для будущего профиля. Сейчас форма работает в демонстрационном режиме."
    >
      <form
        onSubmit={form.handleSubmit(async () => {
          setError(null);
          try {
            await submitAuthPreview("registration");
            setStatus(
              "Данные формы проверены. Аккаунт не создан: регистрация будет подключена вместе с backend.",
            );
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Не удалось обработать форму.");
          }
        })}
        noValidate
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Имя</FieldLabel>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <FieldError>{form.formState.errors.name.message}</FieldError>
            ) : null}
          </Field>
          <EmailField
            registered={form.register("email")}
            error={form.formState.errors.email?.message}
          />
          <PasswordField
            registered={form.register("password")}
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
          />
        </FieldGroup>
        <SubmitButton pending={form.formState.isSubmitting}>Создать аккаунт</SubmitButton>
        {error ? (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        ) : null}
        <Status value={status} />
      </form>
    </AuthFormShell>
  );
}

function RecoveryForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RecoveryValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" },
  });
  return (
    <AuthFormShell
      title="Восстановить пароль"
      description="Доставка инструкций на email будет подключена вместе с backend. Сейчас письмо не отправляется."
    >
      <form
        onSubmit={form.handleSubmit(async () => {
          setError(null);
          try {
            await submitAuthPreview("recovery");
            setStatus(
              "Email проверен. Письмо не отправлено: доставка инструкций пока не подключена.",
            );
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Не удалось обработать форму.");
          }
        })}
        noValidate
      >
        <FieldGroup>
          <EmailField
            registered={form.register("email")}
            error={form.formState.errors.email?.message}
          />
        </FieldGroup>
        <SubmitButton pending={form.formState.isSubmitting}>Проверить email</SubmitButton>
        {error ? (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        ) : null}
        <Status value={status} />
      </form>
    </AuthFormShell>
  );
}

function EmailField({
  registered,
  error,
}: {
  registered: ReturnType<ReturnType<typeof useForm<LoginValues>>["register"]>;
  error?: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="email@example.com"
        aria-invalid={Boolean(error)}
        {...registered}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
function SubmitButton({ pending, children }: { pending: boolean; children: string }) {
  return (
    <Button className="auth-form__submit" type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="auth-form__spinner" aria-hidden="true" />
          Обработка…
        </>
      ) : (
        children
      )}
    </Button>
  );
}
function AuthFormShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-form">
      <div className="auth-form__heading">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

export function AuthForms() {
  const [mode, setMode] = useState<AuthMode>("login");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % modes.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + modes.length) % modes.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = modes.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    setMode(modes[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="auth-panel" aria-label="Авторизация">
      <div className="auth-tabs" role="tablist" aria-label="Выберите форму">
        {modes.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`auth-tab-${item.id}`}
            aria-controls="auth-panel"
            aria-selected={mode === item.id}
            tabIndex={mode === item.id ? 0 : -1}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id="auth-panel" role="tabpanel" aria-labelledby={`auth-tab-${mode}`} tabIndex={0}>
        {mode === "login" ? (
          <LoginForm onMode={setMode} />
        ) : mode === "registration" ? (
          <RegistrationForm />
        ) : (
          <RecoveryForm />
        )}
      </div>
    </section>
  );
}
