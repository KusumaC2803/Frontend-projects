# API

## Health

`GET /api/health`

Returns API status.

## Create Stripe checkout

`POST /api/checkout/create-session`

Body:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Red Check Overshirt",
      "price": 1499,
      "quantity": 1
    }
  ]
}
```

Returns a Stripe Checkout URL when `STRIPE_SECRET_KEY` is configured.
