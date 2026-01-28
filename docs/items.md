# items

Table storing all store items.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | SERIAL | PRIMARY KEY | - |
| name | VARCHAR(100) | NOT NULL, UNIQUE | - |
| price | BIGINT | NOT NULL, CHECK (price >= 0) | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **SERIAL for id**: Store is not multi-region, so SERIAL is sufficient
- **PRIMARY KEY on id**: Name may change, so id is the stable identifier
- **Name is required and unique**: Store has no duplicate item names
- **Price is BIGINT**: Store operates on IDR only, minimum is 0
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **No delete strategy**: For now, no hard or soft delete is planned
- **Name uniqueness**: Name is unique, so it has an implicit index for name lookup

## Indexes

- PRIMARY KEY on `id`
- UNIQUE constraint on `name` (implicit index for name lookup)

## Triggers

- `update_items_updated_at`: Updates `updated_at` column before UPDATE operations
