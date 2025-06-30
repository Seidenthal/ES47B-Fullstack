# 🎬 ES47B Fullstack - Catálogo de Filmes

## 📋 Descrição do Projeto

Aplicação web fullstack desenvolvida para a disciplina de Programação Web Fullstack (ES47B). O projeto implementa um sistema completo de catálogo de filmes com autenticação, busca e gerenciamento de favoritos, atendendo a todos os requisitos técnicos e de segurança especificados.

### 🎯 Requisitos Funcionais Implementados

✅ **Login** - Sistema completo de autenticação com JWT e validação rigorosa  
✅ **Busca** - Busca de filmes e favoritos com logs de segurança detalhados  
✅ **Inserção** - Adição e remoção de filmes favoritos com validação e sanitização  

## 🏗️ Arquitetura do Sistema (3 Camadas)

### 🎨 Frontend (React.js)
- **Single-Page Application (SPA)** completa
- Interface responsiva com Material-UI
- Comunicação HTTP exclusiva com backend
- Gerenciamento de estado com Context API
- Roteamento com React Router
- **Otimizações implementadas:**
  - Compressão de arquivos estáticos via Vite
  - Code splitting manual para chunks otimizados
  - Minificação Terser em produção

### ⚡ Backend (Express.js)
- **API RESTful** seguindo padrões REST
- Acesso direto ao banco de dados
- Middlewares de segurança robustos
- Sistema de logs abrangente para auditoria
- **Otimizações implementadas:**
  - Compressão de respostas do servidor
  - Sistema de cache em memória
  - Pool de conexões configurado

### 🗄️ Banco de Dados (SQLite)
- Better-SQLite3 com configuração WAL mode
- Prepared statements para máxima segurança
- Pool de conexões otimizado
- Estrutura normalizada com relacionamentos

## 📁 Estrutura de Pastas (Conforme Especificação)

```
ES47B-Fullstack/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (banco, cache, segurança)
│   │   │   ├── cache.js     # Sistema de cache
│   │   │   ├── database.js  # Configuração do banco
│   │   │   ├── https.js     # Configuração SSL/TLS
│   │   │   ├── logger.js    # Sistema de logs
│   │   │   ├── security.js  # Middlewares de segurança
│   │   │   └── validation.js # Validações expandidas
│   │   ├── models/          # Classes de acesso ao banco
│   │   │   ├── Movie.js     # Modelo de filmes e favoritos
│   │   │   └── User.js      # Modelo de usuários
│   │   └── routes/          # Rotas com controladores integrados
│   │       ├── auth.js      # Rotas de autenticação
│   │       ├── movieRoutes.js # Rotas de filmes
│   │       └── protected.js # Middleware de autenticação
│   ├── server.js            # Servidor principal (desenvolvimento)
│   ├── server-production.js # Servidor para produção
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   ├── contexts/        # Context API
    │   ├── hooks/           # Hooks customizados
    │   ├── pages/           # Páginas da aplicação
    │   └── assets/          # Recursos estáticos
    ├── package.json
    └── vite.config.js
```

## 🔒 Implementação de Segurança

### ✅ Falhas de Criptografia
- **HTTPS configurado** com certificados SSL/TLS
- **Senhas hasheadas** com bcrypt (12 salt rounds)
- **JWT com chave secreta** robusta e expiração

### ✅ Prevenção de Injeção
- **Sanitização rigorosa** com DOMPurify e Validator
- **Prepared statements** em todas as consultas SQL
- **Validação de entrada** em todas as rotas
- **Escape de caracteres** especiais

### ✅ Falhas de Identificação e Autenticação
- **Rate limiting** implementado (100 req/15min geral, 5 login/15min)
- **Invalidação correta** de tokens JWT
- **Prevenção de ataques** automatizados
- **Logs de tentativas** de autenticação

### ✅ Logs e Monitoramento
- **Logs de autenticação** (sucesso e falha)
- **Logs de busca** com IP e User-Agent
- **Logs de inserção** de favoritos
- **Logs de erros** detalhados com timestamp

## 🚀 Otimizações Implementadas

### Frontend
- ✅ **Compressão de arquivos estáticos** (Vite)
- ✅ **Code splitting** em chunks separados
- ✅ **Minificação** com Terser
- ✅ **Lazy loading** de componentes

### Backend
- ✅ **Compressão de respostas** (gzip/deflate)
- ✅ **Cache em memória** com TTL configurável
- ✅ **Pool de conexões** SQLite otimizado
- ✅ **Headers de segurança** automatizados

## 🛠️ Validações no Servidor

### Validações Implementadas:
- ✅ **Username**: 3-20 caracteres, alfanuméricos + underscore
- ✅ **Password**: Mínimo 6 caracteres, verificação de senhas comuns
- ✅ **Email**: Formato RFC válido, sanitização
- ✅ **Movie ID**: Número positivo válido
- ✅ **Movie Title**: Sanitização HTML/XSS
- ✅ **Poster URL**: Validação de URL com protocolo
- ✅ **Search Query**: Sanitização e escape de caracteres

### Mensagens de Validação:
- Respostas padronizadas com `{ success, message, errors }`
- Códigos de status HTTP apropriados
- Logs detalhados para auditoria

## 🗃️ Configuração do Banco de Dados

```javascript
// Pool de conexões SQLite otimizado
const db = new Database(dbPath, { 
  timeout: 5000,
  readonly: false,
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Configurações de performance
db.pragma('journal_mode = WAL');    // Write-Ahead Logging
db.pragma('synchronous = NORMAL');  // Balance performance/safety
db.pragma('cache_size = 1000');     // Cache em memória
db.pragma('temp_store = memory');   // Temporários em RAM
```

## 🔧 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm run dev          # Desenvolvimento
npm run start:prod   # Produção
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
```

### Autenticação
- `POST /login` - Login de usuário
- `POST /register` - Registro de usuário
- `POST /logout` - Logout

### Filmes e Favoritos
- `GET /movies` - Listar filmes (público)
- `GET /favorites` - Favoritos do usuário (protegido)
- `POST /favorites` - Adicionar favorito (protegido)
- `DELETE /favorites/:id` - Remover favorito (protegido)
- `GET /search` - Buscar filmes (protegido)

### Utilitárias
- `GET /health` - Status da aplicação
- `GET /profile` - Perfil do usuário (protegido)

## 🧪 Validação de Conformidade

Execute o script de verificação para validar a implementação:

```bash
node check-project.js
```

Este script verifica:
- ✅ Estrutura de pastas conforme especificação
- ✅ Requisitos funcionais implementados
- ✅ Configurações de segurança
- ✅ Otimizações de performance
- ✅ Validações no servidor

## 📝 Critérios de Avaliação Atendidos

- ✅ **Implementação Frontend React.js** - SPA completa
- ✅ **Implementação Backend Express.js** - API RESTful
- ✅ **Estrutura de pastas** - Conforme especificação
- ✅ **Verificação de campos** - Validação rigorosa no servidor
- ✅ **Mensagens de validação** - Padronizadas e detalhadas
- ✅ **Padrão REST** - Implementado corretamente
- ✅ **Segurança completa** - Todas as categorias implementadas
- ✅ **Otimização Frontend** - Compressão e chunking
- ✅ **Otimização Backend** - Cache e compressão
- ✅ **Pool de conexões** - Configurado e otimizado

## 🎬 Demonstração

Para a demonstração em vídeo, o projeto inclui:

1. **Execução via linha de comando** - Scripts npm configurados
2. **Código-fonte organizado** - Estrutura clara e documentada  
3. **Funcionalidades completas** - Login, busca e inserção funcionais
4. **Logs de segurança** - Visíveis durante a execução
5. **Performance otimizada** - Cache e compressão em ação

## 👥 Desenvolvedores

Projeto desenvolvido para ES47B - Programação Web Fullstack

- [@Seidenthal](https://github.com/Seidenthal)  
- [@Cerronera](https://github.com/Cerronera)  
