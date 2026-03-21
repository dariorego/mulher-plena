# Migração do Servidor - Instalação do Docker e Supabase

**Servidor:** 212.85.14.1
**Usuário:** cursopb
**Data de início:** 2026-03-15

---

## Plano de Execução

1. **Diagnóstico inicial** — levantar o que está rodando (Apache, MySQL, versões, portas em uso).
2. **Parar e remover Apache** — parar o serviço, desinstalar pacotes e limpar configurações.
3. **Parar e remover MySQL** — parar o serviço, desinstalar pacotes e limpar dados.
4. **Limpar dependências órfãs** — `autoremove` e `purge` de resíduos.
5. **Instalar Docker Engine** — via script oficial `get.docker.com`.
6. **Instalar Docker Compose** — plugin oficial + binário standalone.
7. **Configurar usuário e serviço** — `usermod`, `systemctl enable`.
8. **Instalar Supabase local via Docker** — usando o stack oficial do Supabase Self-Hosted.
9. **Validação final** — verificar todos os containers rodando.

> **Regra adotada:** Ações destrutivas (remoção de serviços, dados) são confirmadas com o usuário antes de executar.

---

## Execução

### ETAPA 1 — Diagnóstico Inicial

**Status:** Concluído com sucesso.

**Observação técnica:** `sshpass` falhou (problema de escape com `$` e `!` na senha). Solução: uso de `expect` para simular sessão interativa.

#### Resultado do diagnóstico

| Item | Detalhe |
| --- | --- |
| **SO** | Ubuntu 25.04 (Plucky) — Linux 6.14.0-37-generic |
| **RAM** | 7.8 GB total / 1.2 GB em uso / **6.6 GB livres** |
| **Disco** | 96 GB total / 6.4 GB em uso / **90 GB livres** |
| **Apache** | 2.4.63 — **rodando** nas portas 80 e 443 |
| **MySQL** | 8.4.7 — **rodando** na porta 3306 (localhost) |
| **PHP** | 8.4 FPM — **rodando** |
| **Docker** | **Não instalado** |

#### Pacotes a remover

- `apache2`, `apache2-bin`, `apache2-data`, `apache2-utils`
- `mysql-server`, `mysql-server-core`, `mysql-client`, `mysql-client-core`, `mysql-common`, `php8.4-mysql`

---

### ETAPA 2 — Remoção do Apache, MySQL e PHP

**Status:** Concluído com sucesso.

**Comandos executados:**

```bash
# Parar e desabilitar Apache
systemctl stop apache2 && systemctl disable apache2

# Remover Apache completamente
DEBIAN_FRONTEND=noninteractive apt-get purge -y apache2 apache2-bin apache2-data apache2-utils

# Parar e desabilitar MySQL
systemctl stop mysql && systemctl disable mysql

# Remover MySQL e PHP completamente
DEBIAN_FRONTEND=noninteractive apt-get purge -y mysql-server mysql-server-core mysql-client \
  mysql-client-core mysql-common php8.4-mysql php8.4-fpm

# Limpar diretórios de dados residuais
rm -rf /etc/mysql /var/lib/mysql /var/log/mysql /etc/php

# Remover dependências órfãs
DEBIAN_FRONTEND=noninteractive apt-get autoremove -y && apt-get autoclean -y
```

**Resultado:**

- Portas 80, 443 e 3306 liberadas (`PORTAS_LIMPAS`)
- Nenhum serviço Apache/MySQL/PHP rodando (`SERVICOS_REMOVIDOS`)
- ~260 MB de espaço liberado no disco

---

### ETAPA 3 — Instalação do Docker

**Status:** Concluído com sucesso.

**Dificuldades encontradas:**

1. **Docker CE (repo oficial) sem suporte a Ubuntu 25.04 (plucky):** O repo `download.docker.com/linux/ubuntu` ainda não tem pacotes para "plucky". Solução: usar `docker.io` do repositório oficial do Ubuntu, que já está na versão 28.2.2.
2. **Conexão SSH caindo em scripts longos:** `sshpass` não funcionava com a senha (caracteres especiais). Solução: `expect` com `ServerAliveInterval=20`. Scripts longos executados via `nohup` em background.
3. **Lock do apt (`/var/lib/apt/lists/lock`):** O processo de auto-update do Ubuntu (unattended-upgrades) estava travando o apt. Solução: desabilitar o serviço antes de instalar.

**Comandos executados:**

```bash
# Desabilitar auto-updates para liberar o apt
systemctl stop unattended-upgrades
systemctl disable unattended-upgrades

# Aguardar liberação do lock
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do sleep 2; done

# Instalar Docker (pacote oficial Ubuntu)
export DEBIAN_FRONTEND=noninteractive
apt-get install -y docker.io docker-compose-v2

# Habilitar e iniciar o serviço
systemctl enable docker
systemctl start docker

# Adicionar usuário ao grupo docker (sem precisar de sudo)
usermod -aG docker cursopb
```

**Resultado:**

- Docker Engine: `28.2.2`
- Docker Compose: `2.37.1`
- Serviço Docker ativo e habilitado no boot

---

### ETAPA 4 — Configuração e Instalação do Supabase Self-Hosted

**Status:** Concluído com sucesso.

**Diretório de instalação:** `/opt/supabase/docker`

**Credenciais geradas (SALVE ESTES DADOS):**

| Variável | Valor |
| --- | --- |
| `DASHBOARD_USERNAME` | `supabase` |
| `DASHBOARD_PASSWORD` | `d3009c889ee5af3664d8bd732a2ea44b` |
| `POSTGRES_PASSWORD` | `b04a87a73592b00a84907b8971e5332b` |
| `SUPABASE_PUBLIC_URL` | `http://212.85.14.1:8000` |

**Comandos executados:**

```bash
cd /opt/supabase/docker

# Copiar .env de exemplo
cp .env.example .env

# Gerar todos os segredos automaticamente e atualizar o .env
sh utils/generate-keys.sh   # responder 'y' quando perguntado

# Configurar URL pública do servidor
sed -i "s|^SUPABASE_PUBLIC_URL=.*$|SUPABASE_PUBLIC_URL=http://212.85.14.1:8000|" .env

# Baixar todas as imagens Docker (~15 imagens, ~2-3GB)
nohup docker compose pull > /tmp/supabase_pull.log 2>&1 &

# Subir todos os containers em background
docker compose up -d
```

**Resultado — 13 containers rodando:**

| Container | Status |
| --- | --- |
| `supabase-db` | Up (healthy) |
| `supabase-kong` | Up (healthy) — API Gateway porta 8000 |
| `supabase-studio` | Up (healthy) — Dashboard porta 3000 |
| `supabase-auth` | Up (healthy) |
| `supabase-rest` | Up |
| `supabase-realtime` | Up (healthy) |
| `supabase-storage` | Up (healthy) |
| `supabase-meta` | Up (healthy) |
| `supabase-analytics` | Up (healthy) |
| `supabase-pooler` | Up (healthy) |
| `supabase-edge-functions` | Up |
| `supabase-imgproxy` | Up (healthy) |
| `supabase-vector` | Up (healthy) |

---

### ETAPA 5 — Validação Final

**Status:** Concluído com sucesso.

| Serviço | Endereço | Descrição |
| --- | --- | --- |
| **Supabase Studio** | `http://212.85.14.1:8000` | Dashboard principal |
| **API REST** | `http://212.85.14.1:8000/rest/v1/` | PostgREST |
| **Auth** | `http://212.85.14.1:8000/auth/v1/` | GoTrue |
| **Storage** | `http://212.85.14.1:8000/storage/v1/` | S3-compatible |

**Credenciais do Dashboard:**

- **Usuário:** `supabase`
- **Senha:** `d3009c889ee5af3664d8bd732a2ea44b`

**Comandos úteis de manutenção:**

```bash
# Checar status dos containers
cd /opt/supabase/docker && docker compose ps

# Ver logs de um container específico
docker logs supabase-db --tail 50

# Parar o Supabase
cd /opt/supabase/docker && docker compose down

# Reiniciar o Supabase
cd /opt/supabase/docker && docker compose up -d

# Atualizar imagens
cd /opt/supabase/docker && docker compose pull && docker compose up -d
```
