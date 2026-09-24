export const metadata = {
  title: "Tiru Health Provider Portal",
  robots: { index: false, follow: false },
};

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
