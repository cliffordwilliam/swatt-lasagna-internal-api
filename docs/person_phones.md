# person_phones

Table storing all customer phone numbers.

## Columns

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | SERIAL | PRIMARY KEY | - |
| person_id | INTEGER | NOT NULL | - |
| phone_number | VARCHAR(25) | NOT NULL | - |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP |

## Reasoning

- **SERIAL for id**: Store is not multi-region, so SERIAL is sufficient
- **PRIMARY KEY on id**: Phone number may change, so id is the stable identifier
- **Phone is required**: Format is flexible
- **Unique constraint on (person_id, phone_number)**: A person cannot have duplicate phone numbers (e.g., Alice cannot have "555-1234" twice), but different people can have the same phone number (Alice and Bob can both have "555-1234")
- **TIMESTAMPTZ**: Stores UTC and returns local time
- **updated_at trigger**: Automatically updates on row modification
- **No delete strategy**: For now, no hard or soft delete is planned

## Indexes

- PRIMARY KEY on `id`
- UNIQUE constraint on `(person_id, phone_number)`

## Foreign Keys

- `person_id` REFERENCES `persons(id)`

## Triggers

- `update_person_phones_updated_at`: Updates `updated_at` column before UPDATE operations
