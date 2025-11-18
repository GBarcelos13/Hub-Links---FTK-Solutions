import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LinkButton } from '@/components/LinkButton';
import { FirstLoginDialog } from '@/components/FirstLoginDialog';
import { useLinks } from '@/hooks/useLinks';
export default function Dashboard() {
  const {
    links,
    loading
  } = useLinks();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <FirstLoginDialog />
      <Header />
      
      <main className="container mx-auto px-4 py-16 flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              
            </div>
            <h2 className="text-4xl text-foreground mb-4 tracking-tight md:text-4xl font-normal">
              Hub de links Voicemanager
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