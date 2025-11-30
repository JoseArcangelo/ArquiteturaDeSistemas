import express from 'express';
import { createClient } from 'redis';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Redis client
const redis = createClient({
  url: 'redis://redis-cache:6379',
});

redis.on('error', (err) => console.error('Redis error:', err));

// Connect to Redis
await redis.connect();
console.log('Connected to Redis');

// Cache configuration: route -> TTL in seconds
const cacheConfig = {
  'GET:/users/:id': 86400, // 1 day
  'GET:/products': 14400, // 4 hours
  'GET:/orders/:id': 2592000, // 30 days
  'GET:/payments/types': -1, // infinite (set once, never expires)
};

// Utility: generate cache key
function getCacheKey(method, path, params) {
  let key = `${method}:${path}`;
  if (params) {
    key += `:${JSON.stringify(params)}`;
  }
  return key;
}

// Utility: check if route should be cached
function shouldCache(method, originalPath) {
  for (const [route, ttl] of Object.entries(cacheConfig)) {
    const [routeMethod, routePath] = route.split(':');
    if (routeMethod === method && matchRoute(originalPath, routePath)) {
      return { route, ttl };
    }
  }
  return null;
}

// Utility: match route pattern (e.g., /users/:id)
function matchRoute(actualPath, pattern) {
  const patternParts = pattern.split('/').filter(Boolean);
  const actualParts = actualPath.split('/').filter(Boolean);

  if (patternParts.length !== actualParts.length) return false;

  return patternParts.every((part, idx) => part.startsWith(':') || part === actualParts[idx]);
}

// Utility: extract params from path (e.g., /users/123 -> { id: '123' })
function extractParams(actualPath, pattern) {
  const patternParts = pattern.split('/').filter(Boolean);
  const actualParts = actualPath.split('/').filter(Boolean);
  const params = {};

  patternParts.forEach((part, idx) => {
    if (part.startsWith(':')) {
      params[part.slice(1)] = actualParts[idx];
    }
  });

  return params;
}

// Service URLs
const SERVICES = {
  users: 'http://users_service:3005',
  products: 'http://products_service:3006',
  orders: 'http://orders_service:3002',
  payments: 'http://payments_service:3007',
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// === USERS ROUTES ===
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const cacheInfo = shouldCache('GET', '/users/:id');

  if (cacheInfo) {
    const cacheKey = getCacheKey('GET', '/users/:id', { id });
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.set('X-Cache', 'HIT').json(JSON.parse(cachedData));
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }
  }

  try {
    const response = await axios.get(`${SERVICES.users}/users/${id}`);
    const data = response.data;

    if (cacheInfo && cacheInfo.ttl !== -1) {
      try {
        await redis.setEx(getCacheKey('GET', '/users/:id', { id }), cacheInfo.ttl, JSON.stringify(data));
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    } else if (cacheInfo && cacheInfo.ttl === -1) {
      try {
        await redis.set(getCacheKey('GET', '/users/:id', { id }), JSON.stringify(data));
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    }

    res.set('X-Cache', 'MISS').json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// === PRODUCTS ROUTES ===
app.get('/products', async (req, res) => {
  const cacheInfo = shouldCache('GET', '/products');

  if (cacheInfo) {
    const cacheKey = getCacheKey('GET', '/products', null);
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.set('X-Cache', 'HIT').json(JSON.parse(cachedData));
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }
  }

  try {
    const response = await axios.get(`${SERVICES.products}/products`);
    const data = response.data;

    if (cacheInfo && cacheInfo.ttl !== -1) {
      try {
        await redis.setEx(getCacheKey('GET', '/products', null), cacheInfo.ttl, JSON.stringify(data));
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    } else if (cacheInfo && cacheInfo.ttl === -1) {
      try {
        await redis.set(getCacheKey('GET', '/products', null), JSON.stringify(data));
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    }

    res.set('X-Cache', 'MISS').json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// === ORDERS ROUTES ===
app.get('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const cacheInfo = shouldCache('GET', '/orders/:id');

  if (cacheInfo) {
    const cacheKey = getCacheKey('GET', '/orders/:id', { id });
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.set('X-Cache', 'HIT').json(JSON.parse(cachedData));
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }
  }

  try {
    const response = await axios.get(`${SERVICES.orders}/orders/${id}`);
    const data = response.data;

    if (cacheInfo && cacheInfo.ttl !== -1) {
      try {
        await redis.setEx(getCacheKey('GET', '/orders/:id', { id }), cacheInfo.ttl, JSON.stringify(data));
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    } else if (cacheInfo && cacheInfo.ttl === -1) {
      try {
        await redis.set(getCacheKey('GET', '/orders/:id', { id }), JSON.stringify(data));
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    }

    res.set('X-Cache', 'MISS').json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// === PAYMENTS ROUTES ===
app.get('/payments/types', async (req, res) => {
  const cacheInfo = shouldCache('GET', '/payments/types');

  if (cacheInfo) {
    const cacheKey = getCacheKey('GET', '/payments/types', null);
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.set('X-Cache', 'HIT').json(JSON.parse(cachedData));
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }
  }

  // Mock response for payment types
  const paymentTypes = [
    { id: 1, name: 'pix', description: 'Pix' },
    { id: 2, name: 'credit_card', description: 'Credit Card' },
    { id: 3, name: 'debit_card', description: 'Debit Card' },
  ];

  if (cacheInfo && cacheInfo.ttl === -1) {
    try {
      await redis.set(getCacheKey('GET', '/payments/types', null), JSON.stringify(paymentTypes));
    } catch (err) {
      console.error('Redis SET error:', err);
    }
  }

  res.set('X-Cache', 'MISS').json(paymentTypes);
});

// Fallthrough: proxy non-cached routes
app.use(async (req, res) => {
  const { method, path } = req;
  
  try {
    // Determine which service to route to
    let serviceUrl;
    if (path.startsWith('/users')) {
      serviceUrl = `${SERVICES.users}${path}`;
    } else if (path.startsWith('/products')) {
      serviceUrl = `${SERVICES.products}${path}`;
    } else if (path.startsWith('/orders')) {
      serviceUrl = `${SERVICES.orders}${path}`;
    } else if (path.startsWith('/payments')) {
      serviceUrl = `${SERVICES.payments}${path}`;
    } else {
      return res.status(404).json({ error: 'Not found' });
    }

    const response = await axios({
      method,
      url: serviceUrl,
      data: req.body,
      params: req.query,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
