import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">TEMKA.STORE</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Каталог
            </Link>
            <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Telegram
            </a>
            <span>Поддержка 24/7</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 TEMKA.STORE
          </p>
        </div>
      </div>
    </footer>
  );
}
