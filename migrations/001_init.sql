BEGIN;

CREATE TABLE delivery_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO delivery_methods (name) VALUES
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
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payment_methods (name) VALUES
('tunai'),
('kartu kredit'),
('transfer bank'),
('qris');

CREATE TABLE order_statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO order_statuses (name) VALUES
('belum bayar'),
('downpayment'),
('lunas');

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_name ON items(name);

CREATE TABLE persons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE, -- treat this like username
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE person_phones (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES persons(id),
  phone_number VARCHAR(50) NOT NULL,
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (person_id, phone_number)
);

CREATE UNIQUE INDEX idx_person_phones_person_id_pref ON person_phones(person_id) WHERE is_preferred = TRUE;
CREATE INDEX idx_person_phones_phone_number ON person_phones(phone_number);

CREATE TABLE person_addresses (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES persons(id),
  address TEXT NOT NULL,
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (person_id, address)
);

CREATE UNIQUE INDEX idx_person_addresses_person_id_pref ON person_addresses(person_id) WHERE is_preferred = TRUE;

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  order_date TIMESTAMPTZ NOT NULL,
  delivery_date TIMESTAMPTZ NOT NULL CHECK (delivery_date >= DATE(order_date)),
  buyer_phone VARCHAR(50),
  buyer_address TEXT,
  buyer_name VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(50),
  recipient_address TEXT,
  recipient_name VARCHAR(255) NOT NULL,
  shipping_cost INTEGER NOT NULL CHECK (shipping_cost >= 0),
  subtotal_amount INTEGER NOT NULL CHECK (subtotal_amount >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0), -- no check for future possible discount
  note TEXT,
  buyer_id INTEGER NOT NULL REFERENCES persons(id),
  recipient_id INTEGER NOT NULL REFERENCES persons(id),
  delivery_method_id INTEGER NOT NULL REFERENCES delivery_methods(id),
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
  order_status_id INTEGER NOT NULL REFERENCES order_statuses(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_order_status_id ON orders(order_status_id);

CREATE TABLE order_items (
  PRIMARY KEY (order_id, item_id),
  order_id BIGINT NOT NULL REFERENCES orders(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  item_name VARCHAR(255) NOT NULL,
  item_price INTEGER NOT NULL CHECK (item_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TRIGGER update_delivery_methods_updated_at
    BEFORE UPDATE ON delivery_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_statuses_updated_at
    BEFORE UPDATE ON order_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at
    BEFORE UPDATE ON persons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_phones_updated_at
    BEFORE UPDATE ON person_phones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_addresses_updated_at
    BEFORE UPDATE ON person_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;