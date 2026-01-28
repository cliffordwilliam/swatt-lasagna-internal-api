# order_items

Table storing all order to item links.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| order_id | BIGINT | NOT NULL | - |
| item_id | INTEGER | NOT NULL | - |
| item_name | VARCHAR(100) | NOT NULL | - |
| item_price | BIGINT | NOT NULL, CHECK (item_price >= 0) | - |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) | - |
| line_total | BIGINT | GENERATED ALWAYS AS (item_price * quantity) STORED | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **Composite PRIMARY KEY on (order_id, item_id)**: Prevents duplicate links between orders and items
- **Item name is required**: Snapshot of item name at time of order
- **Item price is BIGINT**: Store operates on IDR only, minimum is 0
- **Quantity is required INTEGER**: Snapshot of item quantity, minimum is 1
- **No delete strategy**: For now, no hard or soft delete is planned
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **Line total**: Automatically generated on inserts and updates as `item_price * quantity`

## Indexes

- PRIMARY KEY on `(order_id, item_id)`

## Foreign Keys

- `order_id` REFERENCES `orders(id)`
- `item_id` REFERENCES `items(id)`

## Triggers

- `update_order_items_updated_at`: Updates `updated_at` column before UPDATE operations
