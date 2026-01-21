CREATE TYPE pickup_delivery_enum AS ENUM (
  'pickup',
  'delivery',
  'gojek',
  'citytran',
  'paxel',
  'daytrans',
  'baraya',
  'lintas',
  'bineka',
  'jne'
);

CREATE TYPE payment_enum AS ENUM (
  'tunai',
  'kartu_kredit',
  'transfer_bank',
  'qris'
);

CREATE TYPE order_status_enum AS ENUM (
  'downpayment',
  'belum_bayar',
  'lunas'
);

CREATE TABLE items (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_name VARCHAR,
  price INTEGER
);

CREATE TABLE persons (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_name VARCHAR
);

CREATE TABLE person_phones (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id INTEGER REFERENCES persons(id),
  phone_number VARCHAR,
  is_preferred BOOLEAN
);

CREATE TABLE person_addresses (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id INTEGER REFERENCES persons(id),
  address VARCHAR,
  is_preferred BOOLEAN
);

CREATE TABLE orders (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  po_number VARCHAR,
  buyer_id INTEGER REFERENCES persons(id),
  recipient_id INTEGER REFERENCES persons(id),
  order_date DATE,
  delivery_date DATE,
  total_purchase INTEGER,
  pickup_delivery pickup_delivery_enum,
  shipping_cost INTEGER,
  grand_total INTEGER,
  payment_method payment_enum,
  order_status order_status_enum,
  note TEXT
);

CREATE TABLE order_items (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  item_id INTEGER REFERENCES items(id),
  quantity INTEGER,
  item_name VARCHAR,
  item_price INTEGER
);
