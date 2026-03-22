import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="text-center max-w-md">
        <p className="font-heading text-8xl text-accent/30 mb-4">404</p>
        <h1 className="font-heading text-3xl text-dark mb-4 font-normal">Page Not Found</h1>
        <p className="text-muted text-sm mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3.5 hover:bg-accent transition-colors duration-500">
          Return Home
        </Link>
      </div>
    </div>
  );
}
