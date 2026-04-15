-- Schema simplificado para uso pessoal (sem autenticação)

-- Tabela de links
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Desabilita RLS (acesso público via anon key, uso pessoal)
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Política aberta para uso pessoal
CREATE POLICY "Allow all operations" ON public.links
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilita Realtime para a tabela links
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;
