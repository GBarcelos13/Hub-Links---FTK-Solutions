export function Footer() {
  return (
    <footer className="border-t border-footer-border bg-footer-bg mt-auto">
      <div className="container mx-auto px-5 py-5 flex items-center justify-center">
        <p className="text-xs text-[hsl(var(--footer-fg))]/50">
          &copy; {new Date().getFullYear()} HUB Links
        </p>
      </div>
    </footer>
  );
}
