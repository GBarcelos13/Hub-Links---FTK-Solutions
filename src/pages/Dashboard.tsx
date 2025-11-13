import { Header } from '@/components/Header';
import { LinkButton } from '@/components/LinkButton';
import { useLinks } from '@/contexts/LinksContext';

export default function Dashboard() {
  const { links } = useLinks();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Seus Links de Trabalho
            </h2>
            <p className="text-muted-foreground">
              Acesse rapidamente suas ferramentas essenciais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <LinkButton key={link.id} name={link.name} url={link.url} />
            ))}
          </div>

          {links.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum link disponível no momento.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
