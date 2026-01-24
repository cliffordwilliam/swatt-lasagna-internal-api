BEGIN;

CREATE TABLE pickup_delivery_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO pickup_delivery_methods (name) VALUES
('pickup'),
('delivery'),
('gojek'),
('citytran'),
('paxel'),
('daytrans'),
('baraya'),
('lintas'),
('bineka'),
('jne');

CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO payment_methods (name) VALUES
('tunai'),
('kartu kredit'),
('transfer bank'),
('qris');

CREATE TABLE order_statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO order_statuses (name) VALUES
('belum bayar'),
('downpayment'),
('lunas');

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE persons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE person_phones (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  phone_number VARCHAR(50) NOT NULL,
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX idx_person_phones_person_id ON person_phones(person_id) WHERE is_preferred = TRUE;

CREATE TABLE person_addresses (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX idx_person_addresses_person_id ON person_addresses(person_id) WHERE is_preferred = TRUE;

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  buyer_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
  recipient_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL,
  delivery_date DATE NOT NULL CHECK (delivery_date >= order_date),
  shipping_cost INTEGER NOT NULL CHECK (shipping_cost >= 0) DEFAULT 0,
  pickup_delivery_method_id INTEGER NOT NULL REFERENCES pickup_delivery_methods(id) ON DELETE RESTRICT,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
  order_status_id INTEGER NOT NULL REFERENCES order_statuses(id) ON DELETE RESTRICT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_recipient_id ON orders(recipient_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_order_status_id ON orders(order_status_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id),
  item_name VARCHAR(255) NOT NULL,
  item_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_item_id ON order_items(item_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;