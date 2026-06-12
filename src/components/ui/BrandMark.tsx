import Link from "next/link";
import Image from "next/image";

export function BrandMark() {
  return (
    <Link
      className="flex min-w-0 items-center"
      href="/"
      aria-label="Tiru MedDirectory home"
    >
      <Image
        src="/brand/tiru-primary-logo.svg"
        alt="Tiru MedDirectory"
        width={1200}
        height={420}
        priority
        className="h-12 w-auto max-w-[180px] sm:max-w-[220px]"
      />
    </Link>
  );
}
