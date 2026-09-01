"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useRef, useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerUserAction, requestPasswordResetAction } from "@/modules/auth/server/actions";
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

type AuthMode = "login" | "registration" | "recovery";

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
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const result = await signIn("credentials", { ...values, redirect: false });
      if (!result?.ok) throw new Error("Неверный email или пароль.");
      setStatus("Вход выполнен. Открываем личный кабинет…");
      router.push("/profile");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось обработать форму.");
    }
  });
  return (
    <AuthFormShell
      title="Войти в аккаунт"
      description="После входа гостевая корзина будет безопасно объединена с сохранённой корзиной."
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
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  return (
    <AuthFormShell
      title="Создать аккаунт"
      description="Создайте аккаунт, чтобы хранить корзину и отслеживать свои заказы."
    >
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setError(null);
          try {
            const result = await registerUserAction(values);
            if (!result.ok) {
              throw new Error(
                result.code === "EMAIL_CONFLICT"
                  ? "Аккаунт с таким email уже существует."
                  : "Не удалось создать аккаунт.",
              );
            }
            const session = await signIn("credentials", { ...values, redirect: false });
            if (!session?.ok) throw new Error("Аккаунт создан, но войти автоматически не удалось.");
            setStatus("Аккаунт создан. Открываем личный кабинет…");
            router.push("/profile");
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
      description="Укажите email аккаунта. Ответ не раскрывает, зарегистрирован ли этот адрес."
    >
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setError(null);
          try {
            const result = await requestPasswordResetAction(values);
            if (!result.ok) throw new Error("Не удалось обработать запрос восстановления.");
            setStatus(
              "Если аккаунт существует, запрос подготовлен. Доставка письма пока не настроена.",
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
