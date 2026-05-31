export function RegistrationTrustNote() {
  return (
    <aside className="rounded-lg border border-border bg-muted p-4 sm:p-5">
      <p className="text-sm font-semibold uppercase tracking-normal text-secondary">
        Trust note
      </p>
      <h3 className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
        Verification should protect patients and providers.
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        This preview explains the future workflow without collecting documents,
        uploading files, authenticating users, or writing to a database.
      </p>
    </aside>
  );
}
