import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { getActivePromoBanner } from "@/lib/supabase/promo-banners-public-read";

export async function PromoBanner() {
  console.log("PromoBanner component is rendering");

  const banner = await getActivePromoBanner();

  console.log("[PromoBanner] fetched banner:", banner);

  if (!banner) {
    return null;
  }

  const cardClassName =
    "relative block min-h-32 overflow-hidden rounded-2xl border border-border bg-card";

  const content = banner.imageUrl ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="absolute inset-0 size-full object-cover"
        src={banner.imageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="relative flex h-full min-h-32 flex-col justify-end p-5 text-white">
        <p className="text-lg font-semibold">{banner.title}</p>
        {banner.subtitle ? (
          <p className="mt-1 text-sm text-white/90">{banner.subtitle}</p>
        ) : null}
      </div>
    </>
  ) : (
    <div className="flex h-full min-h-32 flex-col justify-center bg-teal-50 p-5">
      <p className="text-lg font-semibold text-foreground">{banner.title}</p>
      {banner.subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {banner.subtitle}
        </p>
      ) : null}
    </div>
  );

  return (
    <section className="bg-transparent">
      <PageContainer className="py-4">
        {banner.linkUrl ? (
          <Link className={cardClassName} href={banner.linkUrl}>
            {content}
          </Link>
        ) : (
          <div className={cardClassName}>{content}</div>
        )}
      </PageContainer>
    </section>
  );
}
