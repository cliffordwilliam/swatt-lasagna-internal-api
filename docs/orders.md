# orders

Table storing all orders.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | BIGSERIAL | PRIMARY KEY | - |
| order_number | TEXT | NOT NULL, UNIQUE, CHECK (lowercase, trimmed, non-empty, single spaces) | - |
| order_date | TIMESTAMPTZ | NOT NULL | - |
| delivery_date | TIMESTAMPTZ | NOT NULL, CHECK (delivery_date >= DATE(order_date)) | - |
| shipping_cost | BIGINT | NOT NULL, CHECK (shipping_cost >= 0) | - |
| subtotal_amount | BIGINT | NOT NULL, CHECK (subtotal_amount >= 0) | - |
| total_amount | BIGINT | NOT NULL, CHECK (total_amount >= 0) | - |
| note | TEXT | - | - |
| buyer_id | INTEGER | NOT NULL | - |
| buyer_name | VARCHAR(255) | NOT NULL | - |
| buyer_phone | VARCHAR(25) | NOT NULL | - |
| buyer_address | TEXT | NOT NULL | - |
| recipient_id | INTEGER | NOT NULL | - |
| recipient_name | VARCHAR(255) | NOT NULL | - |
| recipient_phone | VARCHAR(25) | NOT NULL | - |
| recipient_address | TEXT | NOT NULL | - |
| delivery_method_id | INTEGER | NOT NULL | - |
| payment_method_id | INTEGER | NOT NULL | - |
| order_status_id | INTEGER | NOT NULL | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **BIGSERIAL for id**: Store is not multi-region, but orders grow fast, so BIGSERIAL is used
- **PRIMARY KEY on id**: Order number may change, so id is the stable identifier
- **Note**: No formatting or rules and is optional
- **Order number**: Required and unique to prevent concurrent insert duplicate. CHECK ensures lowercase, trimmed, non-empty, single spaces only. List-orders API filter uses ILIKE for partial, case-insensitive match (supported by GIN index).
- **Order date and delivery date**: Both required, delivery_date must be >= order_date
- **Prices are BIGINT**: Store operates on IDR only, minimum is 0 for all price fields
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **No delete strategy**: For now, no hard or soft delete is planned
- **Person data snapshot**: Business need person data snapshot on order creation. Buyer and recipient name, phone, and address are required.
- **Total amount**: Trusts app code to calculate correctly
- **Composite index (order_date, order_status_id)**: List-orders query is ordered by order_date DESC and often filtered by order_status_id. The index column order (order_date first, then order_status_id) gives good correlation with the query so the planner can avoid a separate sort. Order date is the leading column because we most often filter/order by order date first and then by order status; order_date-only queries use the index prefix, and it is less likely we ever query by order_status alone or order_status first. Updating order status is the most frequent update; because only that column changes, HOT (Heap-Only Tuple) updates can apply when the updated row still fits on the same page, avoiding extra index maintenance where possible.

## Indexes

- PRIMARY KEY on `id`
- UNIQUE constraint on `order_number` (implicit index for order_number lookup)
- `orders_order_number_search_idx`: GIN index on `order_number` using `gin_trgm_ops` for efficient ILIKE search queries (list orders filter)
- `orders_order_date_status_idx`: Composite B-tree index on `(order_date DESC, order_status_id)` for list-orders (order by order_date, filter by date range and status); column order and direction match the common query pattern
- `orders_delivery_date_idx`: B-tree index on `delivery_date` for filtering and range queries by delivery date (e.g. delivery scheduling, daily delivery lists)

## Foreign Keys

- `buyer_id` REFERENCES `persons(id)`
- `recipient_id` REFERENCES `persons(id)`
- `delivery_method_id` REFERENCES `delivery_methods(id)`
- `payment_method_id` REFERENCES `payment_methods(id)`
- `order_status_id` REFERENCES `order_statuses(id)`

## Triggers

- `update_orders_updated_at`: Updates `updated_at` column before UPDATE operations
