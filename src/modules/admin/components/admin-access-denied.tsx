import Link from "next/link";

export function AdminAccessDenied() {
  return (
    <main className="admin-login">
      <section className="admin-login__panel" aria-labelledby="admin-access-title">
        <div className="admin-login__heading">
          <p className="text-label-caps text-secondary">403</p>
          <h1 id="admin-access-title">Доступ запрещён</h1>
          <p>Для этого раздела нужна учётная запись администратора.</p>
        </div>
        <Link className="button button--secondary button--default" href="/profile">
          Вернуться в личный кабинет
        </Link>
      </section>
    </main>
  );
}
