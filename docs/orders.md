# orders

Table storing all orders.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | BIGSERIAL | PRIMARY KEY | - |
| order_number | TEXT | NOT NULL, UNIQUE | - |
| order_date | TIMESTAMPTZ | NOT NULL | - |
| delivery_date | TIMESTAMPTZ | NOT NULL, CHECK (delivery_date >= DATE(order_date)) | - |
| shipping_cost | BIGINT | NOT NULL, CHECK (shipping_cost >= 0) | - |
| subtotal_amount | BIGINT | NOT NULL, CHECK (subtotal_amount >= 0) | - |
| total_amount | BIGINT | NOT NULL, CHECK (total_amount >= 0) | - |
| note | TEXT | - | - |
| buyer_id | INTEGER | NOT NULL | - |
| buyer_name | VARCHAR(255) | NOT NULL | - |
| buyer_phone | VARCHAR(25) | - | - |
| buyer_address | TEXT | - | - |
| recipient_id | INTEGER | NOT NULL | - |
| recipient_name | VARCHAR(255) | NOT NULL | - |
| recipient_phone | VARCHAR(25) | - | - |
| recipient_address | TEXT | - | - |
| delivery_method_id | INTEGER | NOT NULL | - |
| payment_method_id | INTEGER | NOT NULL | - |
| order_status_id | INTEGER | NOT NULL | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **BIGSERIAL for id**: Store is not multi-region, but orders grow fast, so BIGSERIAL is used
- **PRIMARY KEY on id**: Order number may change, so id is the stable identifier
- **Note**: No formatting or rules and is optional
- **Order number**: No formatting or rules, it is required and unique to prevent concurrent insert duplicate
- **Order date and delivery date**: Both required, delivery_date must be >= order_date
- **Prices are BIGINT**: Store operates on IDR only, minimum is 0 for all price fields
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **No delete strategy**: For now, no hard or soft delete is planned
- **Person data snapshot**: Business need person data snapshot on order creation.
- **Total amount**: Trusts app code to calculate correctly

## Indexes

- PRIMARY KEY on `id`
- UNIQUE constraint on `order_number` (implicit index for order_number lookup)

## Foreign Keys

- `buyer_id` REFERENCES `persons(id)`
- `recipient_id` REFERENCES `persons(id)`
- `delivery_method_id` REFERENCES `delivery_methods(id)`
- `payment_method_id` REFERENCES `payment_methods(id)`
- `order_status_id` REFERENCES `order_statuses(id)`

## Triggers

- `update_orders_updated_at`: Updates `updated_at` column before UPDATE operations
