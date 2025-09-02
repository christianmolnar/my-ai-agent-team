# Database Configuration for F.Insight.AI

## 🎯 Multi-Database Architecture

### 1. **Supabase (PostgreSQL) - Primary Database**
- **Purpose:** User data, portfolios, positions, trades, AI insights
- **Cost:** Free tier: 50,000 rows, 500MB storage
- **Scaling:** $25/month for Pro (5GB), Enterprise available

### 2. **InfluxDB Cloud - Time-Series Database**
- **Purpose:** Portfolio performance snapshots, market data, metrics
- **Cost:** Free tier: 30-day retention, 10MB/5min writes
- **Scaling:** $50/month for higher retention and throughput

### 3. **Vercel KV (Redis) - Cache Layer**
- **Purpose:** Real-time market data, session cache, API responses
- **Cost:** Free tier: 30,000 requests/month
- **Scaling:** $20/month for Pro tier

## 📊 Data Flow Architecture

```
Frontend (Next.js)
    ↓
API Routes (/pages/api/)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   Supabase      │   InfluxDB      │   Vercel KV     │
│   (PostgreSQL)  │   (Time-Series) │   (Redis Cache) │
├─────────────────┼─────────────────┼─────────────────┤
│ • Users         │ • Portfolio     │ • Market Data   │
│ • Portfolios    │   Performance   │ • Session Cache │
│ • Positions     │ • Metrics       │ • API Responses │
│ • Trades        │ • Analytics     │ • Rate Limiting │
│ • AI Insights   │ • Benchmarks    │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

## 🔧 Setup Instructions

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Run the schema.sql file in SQL Editor
4. Get your API keys from Settings > API

### 2. InfluxDB Cloud Setup
1. Go to [cloud2.influxdata.com](https://cloud2.influxdata.com)
2. Create free account
3. Create bucket for portfolio data
4. Generate API token

### 3. Vercel KV Setup
1. In Vercel dashboard, go to Storage
2. Create KV database
3. Copy connection details

### 4. Environment Variables
Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# InfluxDB
INFLUXDB_URL=your_influxdb_url
INFLUXDB_TOKEN=your_influxdb_token
INFLUXDB_ORG=your_org_name
INFLUXDB_BUCKET=portfolio_data

# Vercel KV
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# Optional: Market Data API (Alpha Vantage, IEX, etc.)
MARKET_DATA_API_KEY=your_api_key
```

## 📈 Performance Optimizations

### Database Optimizations
- **Materialized Views:** Pre-computed portfolio summaries
- **Indexes:** Optimized for time-based queries
- **Row Level Security:** User data isolation
- **Connection Pooling:** Supabase handles automatically

### Caching Strategy
- **Real-time Data:** Redis cache (30-second TTL)
- **Portfolio Snapshots:** Cached daily aggregations
- **Static Data:** Edge caching with ISR

### Cost Management
- **Free Tier Limits:**
  - Supabase: 50K rows (≈ 2 years of daily snapshots)
  - InfluxDB: 30-day retention (perfect for charts)
  - Vercel KV: 30K requests/month

## 🚀 Scaling Path

### Phase 1: Free Tier (0-1K users)
- Total cost: $0/month
- Supabase Free + InfluxDB Free + Vercel KV Free

### Phase 2: Growth (1K-10K users)
- Total cost: ~$95/month
- Supabase Pro ($25) + InfluxDB Usage ($50) + Vercel KV Pro ($20)

### Phase 3: Scale (10K+ users)
- Enterprise pricing with dedicated resources
- Consider read replicas and sharding

## 📊 Data Retention Strategy

### Hot Data (Redis - Real-time)
- Market prices: 30 seconds
- Portfolio summaries: 5 minutes
- User sessions: 24 hours

### Warm Data (PostgreSQL - Operational)
- Current positions: Indefinite
- Trade history: 7 years (compliance)
- AI insights: 2 years

### Cold Data (InfluxDB - Analytics)
- Portfolio snapshots: 30 days (free tier)
- Performance metrics: 30 days
- Historical aggregations: Computed and stored in PostgreSQL

This architecture provides:
✅ **High Performance:** Multi-database optimization
✅ **Cost Effective:** $0 to start, scales predictably  
✅ **Real-time Capable:** Redis caching for live data
✅ **Compliant:** Proper data retention and security
✅ **Scalable:** Each component scales independently
