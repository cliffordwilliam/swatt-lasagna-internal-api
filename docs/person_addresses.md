# person_addresses

Table storing all customer addresses.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | SERIAL | PRIMARY KEY | - |
| person_id | INTEGER | NOT NULL | - |
| address | TEXT | NOT NULL | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **SERIAL for id**: Store is not multi-region, so SERIAL is sufficient
- **PRIMARY KEY on id**: Address may change, so id is the stable identifier
- **Address is required**: Format is flexible
- **Unique constraint on (person_id, address)**: A person cannot have duplicate addresses (e.g., Alice cannot have "asd" twice), but different people can have the same address (Alice and Bob can both have "asd")
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **No delete strategy**: For now, no hard or soft delete is planned

## Indexes

- PRIMARY KEY on `id`
- UNIQUE constraint on `(person_id, address)`

## Foreign Keys

- `person_id` REFERENCES `persons(id)`

## Triggers

- `update_person_addresses_updated_at`: Updates `updated_at` column before UPDATE operations
