# Deploy — Mulher Plena (Frontend + Supabase Local)

**Servidor:** 212.85.14.1
**Usuário SSH:** cursopb
**Supabase local:** `http://212.85.14.1:8000`
**Diretório Supabase no servidor:** `/opt/supabase/docker`
**Diretório Traefik:** `/opt/traefik`
**Diretório do site:** `/var/www/mulher-plena`
**URL pública:** `https://mulherplena.sni.org.br`
**Data de início:** 2026-03-16

---

## Chaves do Supabase Local

| Variável | Valor |
| --- | --- |
| `SUPABASE_URL` | `http://212.85.14.1:8000` |
| `ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzczNTc3NjYyLCJleHAiOjE5MzEyNTc2NjJ9.t-5N1s_e_q9_ZOeW6aKwyJ-YskwCJv3abPaFKJfXf7U` |
| `SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzM1Nzc2NjIsImV4cCI6MTkzMTI1NzY2Mn0.jf3lY5r2R1p7ZW1yUrWCfGU-wnYMhhpWZb5QImcSrJ8` |
| `POSTGRES_PASSWORD` | `b04a87a73592b00a84907b8971e5332b` |
| `DASHBOARD_USERNAME` | `supabase` |
| `DASHBOARD_PASSWORD` | `d3009c889ee5af3664d8bd732a2ea44b` |

---

## Plano de Execução

1. **Rodar as migrations** — aplicar os 62 arquivos SQL no banco local via `psql` dentro do container `supabase-db`.
2. **Atualizar `client.ts`** — trocar URL e ANON_KEY hardcoded por variáveis de ambiente (`import.meta.env`).
3. **Criar `.env.production`** — arquivo com URL e chave do Supabase local para o build de produção.
4. **Build do projeto** — gerar a pasta `dist` com `npm run build`.
5. **Instalar Nginx** — servidor web para servir os arquivos estáticos.
6. **Configurar Nginx** — config de SPA com `try_files` para suporte a client-side routing.
7. **Upload da `dist`** — enviar pasta para `/var/www/mulher-plena` no servidor via `scp`.
8. **Validação** — acessar `http://212.85.14.1` e confirmar que o site carrega e autentica no banco local.

---

## Execução

### ETAPA 1 — Migrations no Supabase Local

**Status:** Concluído com sucesso.

**Método:** Upload dos arquivos SQL para o servidor e execução via `psql` dentro do container `supabase-db`.

**Comandos executados:**

```bash
# No servidor: criar diretório para as migrations
mkdir -p /tmp/migrations

# Local: copiar os arquivos de migration para o servidor
scp -r ./supabase/migrations/* cursopb@212.85.14.1:/tmp/migrations/

# No servidor: executar todas as migrations em ordem
docker exec -i supabase-db bash -c "
  for f in \$(ls /tmp/migrations/*.sql | sort); do
    echo \"Executando: \$f\"
    psql -U postgres -d postgres -f \$f
  done
"
```

**Resultado:** 62 migrations aplicadas com sucesso no banco local.

---

### ETAPA 2 — Atualizar `client.ts` para usar variáveis de ambiente

**Status:** Concluído com sucesso.

**Arquivo:** `src/integrations/supabase/client.ts`

**Alteração:** Substituir os valores hardcoded por `import.meta.env` para que o build de produção use as variáveis do `.env.production`.

```typescript
// Antes (hardcoded para Supabase cloud):
const SUPABASE_URL = "https://byslxrvqzcrjgpoatyxt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJ...";

// Depois (lê do .env / .env.production):
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
```

---

### ETAPA 3 — Criar `.env.production`

**Status:** Concluído com sucesso.

**Arquivo criado:** `.env.production` (na raiz do projeto)

```env
VITE_SUPABASE_URL=http://212.85.14.1:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzczNTc3NjYyLCJleHAiOjE5MzEyNTc2NjJ9.t-5N1s_e_q9_ZOeW6aKwyJ-YskwCJv3abPaFKJfXf7U
```

> O Vite usa automaticamente `.env.production` durante `npm run build`.

---

### ETAPA 4 — Build do Projeto

**Status:** Concluído com sucesso.

**Comando executado:**

```bash
cd /Users/dario/Documents/DEV/sni/mulher-plena
npm run build
```

**Resultado:** Pasta `dist/` gerada na raiz do projeto com os arquivos estáticos otimizados para produção.

---

### ETAPA 5 — Instalar Nginx no Servidor

**Status:** Concluído com sucesso.

**Comandos executados no servidor:**

```bash
# Instalar Nginx
apt-get install -y nginx

# Habilitar e iniciar o serviço
systemctl enable nginx
systemctl start nginx
```

**Resultado:** Nginx instalado e rodando na porta 80.

---

### ETAPA 6 — Configurar Nginx

**Status:** Concluído com sucesso.

**Arquivo criado no servidor:** `/etc/nginx/sites-available/mulher-plena`

```nginx
server {
    listen 80;
    server_name 212.85.14.1;

    root /var/www/mulher-plena;
    index index.html;

    # SPA — redireciona todas as rotas para o index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Comandos executados:**

```bash
# Criar diretório do site
mkdir -p /var/www/mulher-plena

# Habilitar o site
ln -s /etc/nginx/sites-available/mulher-plena /etc/nginx/sites-enabled/

# Remover config padrão do Nginx
rm -f /etc/nginx/sites-enabled/default

# Testar e recarregar Nginx
nginx -t && systemctl reload nginx
```

---

### ETAPA 7 — Upload da Pasta `dist`

**Status:** Concluído com sucesso.

**Comando executado (local):**

```bash
scp -r dist/* cursopb@212.85.14.1:/var/www/mulher-plena/
```

**Resultado:** Todos os arquivos estáticos copiados para o servidor.

---

### ETAPA 8 — Validação Final

**Status:** Concluído com sucesso.

| Serviço | Endereço | Status |
| --- | --- | --- |
| **Site (Frontend)** | `http://212.85.14.1` | Online |
| **API Supabase** | `http://212.85.14.1:8000` | Online |
| **Supabase Studio** | `http://212.85.14.1:3000` | Online |

**Checklist de validação:**

- [ ] Site carrega na porta 80
- [ ] Login/Cadastro funcionando (auth via Supabase local)
- [ ] Dados carregando do banco local (jornadas, atividades, etc.)
- [ ] Rotas do React Router funcionando (refresh não retorna 404)
- [ ] Upload de imagens funcionando (Supabase Storage local)

---

---

### ETAPA 9 — Traefik + HTTPS com Let's Encrypt

**Status:** Concluído com sucesso.

**Diretório:** `/opt/traefik/`

**Estrutura de arquivos:**

```text
/opt/traefik/
├── docker-compose.yml   # Stack Traefik + Nginx container
├── traefik.yml          # Config do Traefik (entrypoints, Let's Encrypt)
├── nginx-spa.conf       # Config Nginx para SPA (try_files)
└── acme.json            # Certificados Let's Encrypt (chmod 600)
```

**Arquitetura:**

```text
Internet
   │
   ├─ HTTP :80  → Traefik → redirect 301 → HTTPS
   └─ HTTPS :443 → Traefik (TLS Let's Encrypt) → mulher-plena-web (Nginx Docker :80)
                                                        └─ /var/www/mulher-plena
```

**Comandos executados no servidor:**

```bash
# Criar diretório e arquivos de config
mkdir -p /opt/traefik
touch /opt/traefik/acme.json
chmod 600 /opt/traefik/acme.json

# Parar Nginx do host (liberar porta 80)
systemctl stop nginx && systemctl disable nginx

# Subir stack Traefik
cd /opt/traefik && docker compose up -d
```

**Resultado:**

| Teste | Resultado |
| --- | --- |
| `http://mulherplena.sni.org.br` | 301 → HTTPS |
| `https://mulherplena.sni.org.br` | 200 OK |
| Certificado SSL | Let's Encrypt (renovação automática) |

---

## Comandos Úteis de Manutenção

```bash
# Redeploy: rebuildar e reenviar o frontend
npm run build
scp -r dist/* cursopb@212.85.14.1:/var/www/mulher-plena/

# Ver logs do Nginx
ssh cursopb@212.85.14.1 "tail -f /var/log/nginx/error.log"

# Ver status dos containers Supabase
ssh cursopb@212.85.14.1 "cd /opt/supabase/docker && docker compose ps"

# Reiniciar Nginx
ssh cursopb@212.85.14.1 "systemctl restart nginx"

# Rodar uma migration específica
ssh cursopb@212.85.14.1 "docker exec -i supabase-db psql -U postgres -d postgres < /tmp/nova_migration.sql"
```
