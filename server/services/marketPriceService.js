const { getRedisClient } = require('../config/redis');

const CACHE_TTL_SECONDS = Number(process.env.MARKET_PRICE_CACHE_TTL || 300);
const API_LIMIT = Number(process.env.MARKET_PRICE_API_LIMIT || 10);
const API_URL = process.env.MARKET_PRICE_API_URL ||
  'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = process.env.MARKET_PRICE_API_KEY;

const vegetables = new Set([
  'bean', 'bottle gourd', 'brinjal', 'cabbage', 'carrot', 'cauliflower',
  'cluster beans', 'cucumber', 'garlic', 'ginger', 'green chillies', 'okra',
  'onion', 'peas', 'potato', 'pumpkin', 'spinach', 'tomato'
]);

const fruits = new Set([
  'apple', 'banana', 'grapes', 'guava', 'mango', 'orange', 'papaya',
  'pomegranate', 'pineapple', 'watermelon'
]);

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function getCategory(commodity, recordCategory) {
  const normalizedCommodity = normalize(commodity);
  const normalizedCategory = normalize(recordCategory);

  if (normalizedCategory === 'vegetables' || vegetables.has(normalizedCommodity)) {
    return 'vegetables';
  }
  if (normalizedCategory === 'fruits' || fruits.has(normalizedCommodity)) {
    return 'fruits';
  }
  return normalizedCategory || 'other';
}

function toNumber(value) {
  const number = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(number) ? number : null;
}

function transformRecord(record) {
  const name = record.commodity || record.Commodity || record.name || record.Name;
  const currentPrice = toNumber(
    record.modal_price ?? record.Modal_Price ?? record.modalPrice ?? record.currentPrice
  );

  if (!name || currentPrice === null) {
    return null;
  }

  const previousPrice = toNumber(record.previousPrice) ?? currentPrice;
  const category = getCategory(name, record.category);

  return {
    name: String(name).trim(),
    category,
    currentPrice,
    previousPrice,
    unit: record.unit || 'per quintal',
    market: record.market || record.Market || record.market_name || 'Local market',
    state: record.state || record.State || null,
    district: record.district || record.District || null,
    arrivalDate: record.arrival_date || record.Arrival_Date || null,
    source: 'government-api'
  };
}

function getCacheKey(state, district, category) {
  const location = `${normalize(state)}:${normalize(district)}`;
  return `kisaan:cache:market-prices:${location}:${normalize(category) || 'all'}`;
}

async function fetchExternalPrices({ state, district, category }) {
  if (!API_URL || !API_KEY) {
    return null;
  }

  const url = new URL(API_URL);
  url.searchParams.set('api-key', API_KEY);
  url.searchParams.set('format', 'json');
  url.searchParams.set('offset', '0');
  url.searchParams.set('limit', String(API_LIMIT));
  url.searchParams.set('filters[state]', state);
  url.searchParams.set('filters[district]', district);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Market price API returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  const records = Array.isArray(payload.records) ? payload.records : [];
  const prices = records.map(transformRecord).filter(Boolean);

  if (!category) {
    return prices;
  }

  return prices.filter((price) => price.category === normalize(category));
}

async function getLocationMarketPrices({ state, district, category }) {
  const cacheKey = getCacheKey(state, district, category);
  const redis = getRedisClient();

  try {
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const prices = await fetchExternalPrices({ state, district, category });
    if (prices === null) {
      return null;
    }

    if (redis) {
      await redis.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(prices));
    }

    return prices;
  } catch (error) {
    console.error('Error reading or fetching location market prices:', error.message);
    return null;
  }
}

module.exports = { getLocationMarketPrices };
