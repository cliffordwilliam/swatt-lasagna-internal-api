# persons

Table storing all customers.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | SERIAL | PRIMARY KEY | - |
| name | VARCHAR(255) | NOT NULL | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **SERIAL for id**: Store is not multi-region, so SERIAL is sufficient
- **PRIMARY KEY on id**: Name may change, so id is the stable identifier
- **Name is required**: Store has duplicate person names (multiple people can have the same name)
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **No delete strategy**: For now, no hard or soft delete is planned
- **Name index**: Index created for name lookup performance

## Indexes

- PRIMARY KEY on `id`
- `idx_persons_name` on `name` (for name lookup)

## Triggers

- `update_persons_updated_at`: Updates `updated_at` column before UPDATE operations
