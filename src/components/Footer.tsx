import { Mail, Phone, MapPin } from 'lucide-react';
export function Footer() {
  const currentYear = new Date().getFullYear();
  return <footer className="w-full border-t-2 border-footer-border bg-footer-bg mt-auto">
      <div className="container mx-auto px-4 py-8 bg-gray-950">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-footer-fg mb-3">VoiceManager</h3>
            <p className="text-sm text-footer-fg/70">
              Plataforma completa para gerenciamento de comunicações empresariais.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-footer-fg mb-3">Contato</h3>
            <div className="space-y-2">
              <a href="mailto:contato@voicemanager.com.br" className="flex items-center gap-2 text-sm text-footer-fg/70 hover:text-footer-fg transition-colors">
                <Mail className="h-4 w-4" />
                contato@voicemanager.com.br
              </a>
              <a href="tel:08005805811" className="flex items-center gap-2 text-sm text-footer-fg/70 hover:text-footer-fg transition-colors">
                <Phone className="h-4 w-4" />
                0800 580 5811
              </a>
              
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-footer-fg mb-3">Localização</h3>
            <div className="flex items-start gap-2 text-sm text-footer-fg/70">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Belo Horizonte, MG
Brasil<br />Brasil</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-footer-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-footer-fg/70">
              © {currentYear} VoiceManager. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-footer-fg/70 hover:text-footer-fg transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm text-footer-fg/70 hover:text-footer-fg transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-footer-fg/70 hover:text-footer-fg transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}