# Guia de DevOps - Projeto Mulher Plena

Este documento contém as instruções de configuração, build e deploy do projeto gerado via Lovable.

## 1. Comandos para Rodar o Projeto (Pós-Clone)

O projeto usa **Node.js** e o bundler **Vite** (padrão do Lovable). Após clonar o repositório, certifique-se de estar na pasta raiz e execute os comandos:

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor de desenvolvimento local
npm run dev

# 3. Gerar a build de produção (cria/atualiza a pasta 'dist')
npm run build
```

---

## 2. Instalação do Docker e Docker Compose no Servidor Linux

Esta seção cobre a instalação do Docker Engine e do Docker Compose em um servidor Linux (Ubuntu/Debian) que ainda não possui Docker instalado.

### A. Remover versões antigas (se houver)

```bash
sudo apt-get remove -y docker docker-engine docker.io containerd runc
```

### B. Instalar o Docker Engine (método oficial via script)

O jeito mais rápido e recomendado para servidores novos:

```bash
# Baixa e executa o script oficial de instalação do Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

> Alternativamente, para instalar manualmente via repositório APT:
>
> ```bash
> # Instala dependências necessárias
> sudo apt-get update
> sudo apt-get install -y ca-certificates curl gnupg lsb-release
>
> # Adiciona a chave GPG oficial do Docker
> sudo install -m 0755 -d /etc/apt/keyrings
> curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
> sudo chmod a+r /etc/apt/keyrings/docker.gpg
>
> # Adiciona o repositório oficial do Docker
> echo \
>   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
>   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
>   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
>
> # Instala o Docker Engine
> sudo apt-get update
> sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
> ```

### C. Habilitar e iniciar o serviço Docker

```bash
# Inicia o serviço e habilita para subir automaticamente no boot
sudo systemctl enable docker
sudo systemctl start docker

# Verifica se está rodando corretamente
sudo systemctl status docker
```

### D. Permitir rodar Docker sem `sudo` (opcional, mas recomendado)

```bash
# Adiciona o usuário atual ao grupo docker
sudo usermod -aG docker $USER

# Aplica a mudança de grupo na sessão atual (sem precisar fazer logout)
newgrp docker
```

> Depois de executar o `newgrp docker`, você poderá rodar `docker` sem `sudo`. Em uma nova conexão SSH, a mudança já estará ativa automaticamente.

### E. Instalar o Docker Compose (standalone, se necessário)

O `docker-compose-plugin` já instala o Compose como subcomando (`docker compose`). Se precisar do binário standalone (`docker-compose`):

```bash
# Baixa a versão mais recente do Docker Compose standalone
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dá permissão de execução
sudo chmod +x /usr/local/bin/docker-compose
```

### F. Verificar a instalação

```bash
# Verifica versão do Docker
docker --version

# Verifica versão do Compose (plugin)
docker compose version

# Verifica versão do Compose (standalone, se instalado)
docker-compose --version

# Testa com um container de exemplo
docker run hello-world
```

---

## 3. Estrutura do Processo Docker no Servidor Linux (com Traefik)

Para hospedar o projeto no servidor utilizando Docker e Traefik como reverse proxy (para gerenciar rotas e subdomínios via HTTPS), você precisará de três arquivos principais na raiz ou no diretório de deploy: um `Dockerfile`, as regras do nginx `nginx.conf` e o `docker-compose.yml`.

### A. Dockerfile

Cria uma imagem otimizada em duas etapas (build do Lovable + Nginx para servir os estáticos):

```dockerfile
# Etapa 1: Build da aplicação (Node)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copia o build final (pasta dist) gerado na etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia as regras de rota exclusivas (necessário para SPA/React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### B. nginx.conf

Arquivo necessário para instruir o nginx a direcionar as requisições para o `index.html`, evitando o erro 404 ao atualizar a página (comum em SPAs).

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        # Redireciona rotas inexistentes para o index.html
        try_files $uri $uri/ /index.html;
    }
}
```

### C. docker-compose.yml

Este arquivo orquestra a aplicação e faz a integração com o Traefik pelas `labels`.

```yaml
version: '3.8'

services:
  app-mulher-plena:
    build: .
    container_name: mulher-plena-app
    restart: unless-stopped
    networks:
      - traefik-public # Substitua pelo nome da rede onde o Traefik está rodando
    labels:
      - "traefik.enable=true"
      # URL DE ACESSO (Substitua mulher-plena.com.br pelo seu domínio real)
      - "traefik.http.routers.mulher-plena.rule=Host(`mulher-plena.com.br`)" 
      - "traefik.http.routers.mulher-plena.entrypoints=websecure"
      # Configuração automática do HTTPS (Let's Encrypt configurado no Traefik)
      - "traefik.http.routers.mulher-plena.tls.certresolver=letsencrypt" 
      # Porta interna do container Nginx (o traefik se comunica com a 80)
      - "traefik.http.services.mulher-plena.loadbalancer.server.port=80"

networks:
  # Referencia externa de rede já existente operada pelo Traefik
  traefik-public:
    external: true
```

---

## 4. Publicação da pasta `dist` no Servidor Linux

Existem duas formas preferidas para fazer o deploy das atualizações no seu servidor final.

### Opção A: Build dentro do servidor (Recomendado se o servidor tiver boa memória)

Envolve enviar o código-fonte (ou puxar com o `git pull`) direto no servidor.
Sempre que o código em produção for atualizado, basta rodar o comando do Docker Compose para reconstruir a imagem:

```bash
# Executa dentro do servidor Linux na pasta onde está o docker-compose.yml
docker-compose up -d --build
```

> O Docker fará o `npm run build` na própria máquina (pode consumir memória RAM da VPS (mínimo de 1.5GB livres são recomendados)) e, em seguida, substituirá o container em execução.

### Opção B: Build Local -> Enviar pasta `dist` via SCP / Rsync

Recomendado se sua VPS tiver baixa capacidade de processamento, pois alivia o servidor de compilar o Node. O "build" é feito no seu computador local.

1. **Gere a build localmente:**

   ```bash
   npm run build
   ```

2. **Transfira a pasta `dist` para o servidor (MacOS / Linux local):**
   Use `rsync` para enviar toda a pasta substituindo/apagando apenas os modificados no destino:

   ```bash
   rsync -avz --delete ./dist/ root@IP_DO_SERVIDOR:/caminho/no/servidor/mulher-plena/dist/
   ```

3. **No Servidor (Configuração sem Dockerfile, apenas Nginx montado):**
   Neste cenário da Opção B, você dispensa o bloco `build:` no `docker-compose.yml` e monta o site em um Nginx direto através de volumes:

   ```yaml
   services:
     app-mulher-plena:
       image: nginx:alpine
       container_name: mulher-plena-app
       volumes:
         # Mapeia a pasta enviada para o lugar padrão do nginx no container
         - /caminho/no/servidor/mulher-plena/dist:/usr/share/nginx/html
         - /caminho/no/servidor/mulher-plena/nginx.conf:/etc/nginx/conf.d/default.conf
       networks:
         - traefik-public
       labels:
         # (Mesmas configurações de Labels do Traefik da seção anterior)
         ...
   ```

   Com esse Setup via **volume**, sempre que você executar o passo 2 (o Rsync), a interface em produção atualiza **na hora**, sem precisar dar restart no container.
