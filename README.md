# Rotavera Aggregation API

Federated search across the Rotavera merchant network.

## Features

- Federated search across 20 merchants
- A2AUAS natural language query parsing
- Response caching (5 min TTL)
- Rate limiting
- Merchant registry management

## Quick Start

```bash
npm install
npm run dev
```

## API Endpoints

### POST /search

Structured query:

```json
{
  "query": "coffee beans",
  "category": "coffee",
  "maxPrice": 30,
  "limit": 20
}
```

Natural language query (A2AUAS):

```json
{
  "naturalLanguage": "find me some coffee beans under $30"
}
```

### GET /merchants

List all registered merchants.

Query params:
- `category`: Filter by category
- `status`: Filter by status (`active`/`inactive`)

### GET /health

Basic health endpoint.

## Deployment

Railway one-click deploy ready with `railway.json`.
