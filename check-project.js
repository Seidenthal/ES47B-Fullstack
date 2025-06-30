#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

class ProjectChecker {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    this.checks.push({ message, type, timestamp });
  }

  async checkFileExists(filepath, description) {
    if (existsSync(filepath)) {
      this.log(`${description} encontrado: ${filepath}`);
      return true;
    } else {
      this.log(`${description} não encontrado: ${filepath}`, 'error');
      return false;
    }
  }

  async checkPackageJson(path, projectName) {
    const packagePath = join(path, 'package.json');
    if (!existsSync(packagePath)) {
      this.log(`package.json não encontrado em ${path}`, 'error');
      return false;
    }

    try {
      const packageData = JSON.parse(readFileSync(packagePath, 'utf8'));
      this.log(`${projectName} - package.json válido`);
      
      if (packageData.dependencies) {
        const depCount = Object.keys(packageData.dependencies).length;
        this.log(`${projectName} - ${depCount} dependências encontradas`);
      }
      
      return true;
    } catch (error) {
      this.log(`${projectName} - package.json inválido: ${error.message}`, 'error');
      return false;
    }
  }

  async checkNodeModules(path, projectName) {
    const nodeModulesPath = join(path, 'node_modules');
    if (existsSync(nodeModulesPath)) {
      this.log(`${projectName} - node_modules encontrado`);
      return true;
    } else {
      this.log(`${projectName} - node_modules não encontrado. Execute 'npm install'`, 'warning');
      return false;
    }
  }

  async checkBackendStructure() {
    this.log('🔍 Verificando estrutura do backend...');
    
    const backendPath = './backend';
    const requiredFiles = [
      { path: 'server.js', desc: 'Servidor principal' },
      { path: 'server-production.js', desc: 'Servidor de produção' },
      { path: 'src/config/database.js', desc: 'Configuração do banco' },
      { path: 'src/config/security.js', desc: 'Configuração de segurança' },
      { path: 'src/config/cache.js', desc: 'Sistema de cache' },
      { path: 'src/config/https.js', desc: 'Configuração HTTPS' },
      { path: 'src/config/validation.js', desc: 'Validações expandidas' },
      { path: 'src/config/logger.js', desc: 'Sistema de logs' },
      { path: 'src/models/User.js', desc: 'Modelo de usuário' },
      { path: 'src/models/Movie.js', desc: 'Modelo de filmes' },
      { path: 'src/routes/auth.js', desc: 'Rotas de autenticação' },
      { path: 'src/routes/protected.js', desc: 'Rotas protegidas' },
      { path: 'src/routes/movieRoutes.js', desc: 'Rotas de filmes' }
    ];

    let allFound = true;
    for (const file of requiredFiles) {
      const found = await this.checkFileExists(join(backendPath, file.path), file.desc);
      if (!found) allFound = false;
    }

    await this.checkPackageJson(backendPath, 'Backend');
    await this.checkNodeModules(backendPath, 'Backend');

    return allFound;
  }

  async checkFrontendStructure() {
    this.log('🔍 Verificando estrutura do frontend...');
    
    const frontendPath = './frontend';
    const requiredFiles = [
      { path: 'src/App.jsx', desc: 'Componente principal' },
      { path: 'src/main.jsx', desc: 'Ponto de entrada' },
      { path: 'src/routes.jsx', desc: 'Configuração de rotas' },
      { path: 'src/contexts/AppReducerContext.jsx', desc: 'Context principal' },
      { path: 'src/contexts/NotificationContext.jsx', desc: 'Context de notificações' },
      { path: 'src/hooks/useFavorites.js', desc: 'Hook de favoritos' },
      { path: 'src/components/MovieCard.jsx', desc: 'Componente de filme' },
      { path: 'src/components/MovieList.jsx', desc: 'Lista de filmes' },
      { path: 'src/pages/LoginPage.jsx', desc: 'Página de login' },
      { path: 'src/pages/RegisterPage.jsx', desc: 'Página de registro' },
      { path: 'vite.config.js', desc: 'Configuração do Vite' }
    ];

    let allFound = true;
    for (const file of requiredFiles) {
      const found = await this.checkFileExists(join(frontendPath, file.path), file.desc);
      if (!found) allFound = false;
    }

    await this.checkPackageJson(frontendPath, 'Frontend');
    await this.checkNodeModules(frontendPath, 'Frontend');

    return allFound;
  }

  async checkDatabaseFiles() {
    this.log('🔍 Verificando arquivos do banco de dados...');
    
    const dbFiles = [
      { path: './backend/db.sqlite', desc: 'Banco de dados principal' },
      { path: './backend/db/movies.sql', desc: 'Script SQL de filmes' },
      { path: './backend/favoritos.sql', desc: 'Script SQL de favoritos' }
    ];

    for (const file of dbFiles) {
      await this.checkFileExists(file.path, file.desc);
    }
  }

  async checkDocumentation() {
    this.log('🔍 Verificando documentação...');
    
    const docs = [
      { path: './README.md', desc: 'README principal' },
      { path: './DEPLOY.md', desc: 'Guia de deploy' },
      { path: './backend/.env.example', desc: 'Exemplo de configuração' }
    ];

    for (const doc of docs) {
      await this.checkFileExists(doc.path, doc.desc);
    }
  }

  async testBackendHealth() {
    this.log('🔍 Testando saúde do backend...');
    
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        this.log(`Backend respondendo: ${data.status}`);
        return true;
      } else {
        this.log('Backend não está respondendo corretamente', 'warning');
        return false;
      }
    } catch (error) {
      this.log('Backend não está rodando ou não acessível', 'warning');
      return false;
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE VERIFICAÇÃO DO PROJETO');
    console.log('='.repeat(60));

    console.log(`\n✅ Verificações realizadas: ${this.checks.length}`);
    console.log(`⚠️  Avisos: ${this.warnings.length}`);
    console.log(`❌ Erros: ${this.errors.length}`);

    if (this.warnings.length > 0) {
      console.log('\n⚠️  AVISOS:');
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERROS:');
      this.errors.forEach(error => console.log(`   - ${error}`));
    }

    const status = this.errors.length === 0 ? '✅ APROVADO' : '❌ REPROVADO';
    console.log(`\n🏆 STATUS FINAL: ${status}`);
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 Projeto está completo e pronto para uso!');
    } else if (this.errors.length === 0) {
      console.log('\n👍 Projeto funcional, mas há algumas recomendações.');
    } else {
      console.log('\n🔧 Projeto precisa de correções antes do uso.');
    }

    console.log('\n' + '='.repeat(60));
  }

  async run() {
    console.log('🚀 Iniciando verificação do projeto fullstack...\n');

    await this.checkBackendStructure();
    await this.checkFrontendStructure();
    await this.checkDatabaseFiles();
    await this.checkDocumentation();
    await this.testBackendHealth();

    await this.generateReport();
  }
}

// Executar verificação
const checker = new ProjectChecker();
checker.run().catch(console.error);
