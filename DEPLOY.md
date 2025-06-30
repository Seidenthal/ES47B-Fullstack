# 🚀 Guia de Deploy - Projeto Fullstack ES47B

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Servidor Linux/Windows com acesso SSH (para produção)
- Domínio configurado (opcional)

## 🔧 Deploy Local (Desenvolvimento)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## 🌐 Deploy em Produção

### 1. Preparar o Backend

```bash
cd backend

# Instalar dependências
npm install --production

# Configurar variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env`:
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
FRONTEND_URL=https://seu-dominio.com
DB_PATH=./db.sqlite
```

### 2. Preparar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Build para produção
npm run build:prod
```

### 3. Configurar Nginx (Recomendado)

Crie o arquivo `/etc/nginx/sites-available/fullstack-app`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend estático
    location / {
        root /caminho/para/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rotas diretas do backend (compatibilidade)
    location ~ ^/(login|register|favorites|health)$ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar o site:
```bash
sudo ln -s /etc/nginx/sites-available/fullstack-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configurar SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### 5. Configurar PM2 para o Backend

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
cd backend
pm2 start server-production.js --name "fullstack-backend"

# Configurar auto-restart
pm2 startup
pm2 save
```

## 📊 Monitoramento

### Logs do Backend (PM2)
```bash
pm2 logs fullstack-backend
pm2 monit
```

### Status da Aplicação
```bash
# Verificar backend
curl http://localhost:3001/health

# Verificar frontend
curl http://seu-dominio.com
```

## 🔒 Segurança em Produção

### 1. Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Backup do Banco de Dados
```bash
# Script de backup diário
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /caminho/para/backend/db.sqlite /backups/db_backup_$DATE.sqlite

# Manter apenas últimos 7 dias
find /backups -name "db_backup_*.sqlite" -mtime +7 -delete
```

Adicionar ao cron:
```bash
crontab -e
# Adicionar linha:
0 2 * * * /caminho/para/backup-script.sh
```

## 🚨 Solução de Problemas

### Backend não inicia
```bash
# Verificar logs
pm2 logs fullstack-backend

# Verificar processo
pm2 status

# Reiniciar
pm2 restart fullstack-backend
```

### Problemas de CORS
- Verificar `FRONTEND_URL` no `.env`
- Verificar configuração do nginx
- Verificar se HTTPS está funcionando

### Banco de dados corrompido
```bash
# Restaurar backup
cp /backups/db_backup_YYYYMMDD_HHMMSS.sqlite /caminho/para/backend/db.sqlite
pm2 restart fullstack-backend
```

## 📈 Otimizações de Performance

### 1. Compressão (já implementada)
- Gzip habilitado no backend
- Build otimizado do frontend

### 2. Cache
- Cache em memória implementado
- Cache estático no nginx
- Cache de CDN (Cloudflare recomendado)

### 3. Monitoramento
- PM2 para monitoramento do processo
- Logs estruturados
- Health checks

## 🔄 Updates e Manutenção

### Atualizar aplicação
```bash
# Backend
cd backend
git pull
npm install --production
pm2 restart fullstack-backend

# Frontend
cd frontend
git pull
npm install
npm run build:prod
# Copiar dist/ para diretório do nginx
```

### Backup antes de updates
```bash
# Backup do banco
cp db.sqlite db_backup_pre_update.sqlite

# Backup do código
tar -czf app_backup_$(date +%Y%m%d).tar.gz /caminho/para/aplicacao
```

---

## 📞 Suporte

Para problemas técnicos:
1. Verificar logs: `pm2 logs`
2. Verificar status: `pm2 status`
3. Verificar nginx: `sudo nginx -t`
4. Verificar SSL: `sudo certbot certificates`

**Desenvolvido para ES47B - Programação Web Fullstack**
