# persons

Table storing all customers.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | SERIAL | PRIMARY KEY | - |
| name | VARCHAR(255) | NOT NULL, UNIQUE | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **SERIAL for id**: Store is not multi-region, so SERIAL is sufficient
- **PRIMARY KEY on id**: Name may change, so id is the stable identifier
- **Name is required and unique**: Each person must have a unique name for identification
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **No delete strategy**: For now, no hard or soft delete is planned

## Indexes

- PRIMARY KEY on `id`
- UNIQUE constraint on `name` (automatically creates a unique index)

## Triggers

- `update_persons_updated_at`: Updates `updated_at` column before UPDATE operations
