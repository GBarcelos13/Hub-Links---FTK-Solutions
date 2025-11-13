import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LinkButton } from '@/components/LinkButton';
import { useLinks } from '@/contexts/LinksContext';
export default function Dashboard() {
  const {
    links
  } = useLinks();
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Ferramentas Voicemanager
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Suas ferramentas essenciais organizadas em um só lugar
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {links.map((link, index) => {
            const isLastAndOdd = links.length % 2 !== 0 && index === links.length - 1;
            return <div key={link.id} className={isLastAndOdd ? "md:col-span-2 flex justify-center" : ""}>
                  <div className={isLastAndOdd ? "w-full max-w-sm" : "w-full"}>
                    <LinkButton name={link.name} url={link.url} />
                  </div>
                </div>;
          })}
          </div>

          {links.length === 0 && <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-muted-foreground text-lg">
                Nenhum link disponível no momento.
              </p>
            </div>}
        </div>
      </main>

      <Footer />
    </div>;
}