// Cache simples em memória para otimização
class SimpleCache {
  constructor(defaultTtl = 5 * 60 * 1000) { // 5 minutos padrão
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }

  set(key, value, ttl = this.defaultTtl) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Limpeza automática de items expirados
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instância global do cache
export const appCache = new SimpleCache();

// Middleware de cache para Express
export const cacheMiddleware = (ttl = 5 * 60 * 1000) => {
  return (req, res, next) => {
    // Apenas para requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = appCache.get(key);

    if (cachedResponse) {
      console.log(`[CACHE] Hit para ${key}`);
      return res.json(cachedResponse);
    }

    // Interceptar res.json para armazenar no cache
    const originalJson = res.json;
    res.json = function(body) {
      // Apenas cachear respostas de sucesso
      if (res.statusCode === 200) {
        appCache.set(key, body, ttl);
        console.log(`[CACHE] Armazenado ${key}`);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

// Limpeza automática a cada 10 minutos
setInterval(() => {
  appCache.cleanup();
  console.log(`[CACHE] Limpeza automática. Itens em cache: ${appCache.size()}`);
}, 10 * 60 * 1000);

export default appCache;
