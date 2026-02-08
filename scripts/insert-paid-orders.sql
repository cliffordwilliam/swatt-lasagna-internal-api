-- Insert paid orders in the past 7 days
-- Uses order_status_id = 3 ('lunas' = paid)

-- Ensure we have at least one person for buyer/recipient (reuse for simplicity)
INSERT INTO persons (name) VALUES ('seed buyer') ON CONFLICT (name) DO NOTHING;
INSERT INTO person_phones (person_id, phone_number)
  SELECT id, '08123456789' FROM persons WHERE name = 'seed buyer'
  ON CONFLICT (person_id, phone_number) DO NOTHING;
INSERT INTO person_addresses (person_id, address)
  SELECT id, 'jl. contoh no. 1, jakarta' FROM persons WHERE name = 'seed buyer'
  ON CONFLICT (person_id, address) DO NOTHING;

DO $$
DECLARE
  bid INT;
  rid INT;
  ph TEXT;
  addr TEXT;
  oid BIGINT;
  iid INT;
  iprice BIGINT;
  iname TEXT;
  ord_date TIMESTAMPTZ;
  del_date TIMESTAMPTZ;
  ship_cost BIGINT;
  sub BIGINT;
  tot BIGINT;
  onum TEXT;
  d INT;
  ord_idx INT;
  var_idx INT;
  qty INT;
  -- 14 variations: (item_name, quantity, shipping_cost)
  var_names TEXT[] := ARRAY[
    'lasagna mini', 'lasagna small', 'lasagna medium', 'macaroni oval', 'lasagna long',
    'marmer cake 1 slice', 'nastar bulat', 'pudding 4 cup', 'lasagna family', 'macaroni mini',
    'kue keju bulat', 'lasagna xtra medium', 'bolu peuyeum 12 slice', 'hampers marmer cake'
  ];
  var_qtys INT[] := ARRAY[2, 1, 1, 3, 1, 5, 1, 1, 1, 4, 1, 1, 1, 1];
  var_ship BIGINT[] := ARRAY[0, 0, 15000, 0, 25000, 0, 0, 10000, 20000, 5000, 0, 30000, 15000, 0];
BEGIN
  SELECT id INTO bid FROM persons WHERE name = 'seed buyer' LIMIT 1;
  rid := bid;
  SELECT phone_number INTO ph FROM person_phones WHERE person_id = bid LIMIT 1;
  SELECT address INTO addr FROM person_addresses WHERE person_id = bid LIMIT 1;

  -- 2 paid orders per day for the past 7 days (14 orders), each with different amount
  FOR d IN 0..6 LOOP
    ord_date := (CURRENT_DATE - (d || ' days')::INTERVAL) + TIME '10:00:00';
    del_date := ord_date + INTERVAL '2 days';

    FOR ord_idx IN 1..2 LOOP
      var_idx := d * 2 + ord_idx;
      ship_cost := var_ship[var_idx];
      qty := var_qtys[var_idx];
      iname := var_names[var_idx];

      SELECT id, price INTO iid, iprice FROM items WHERE name = iname LIMIT 1;
      sub := iprice * qty;
      tot := sub + ship_cost;
      onum := 'paid-' || to_char(ord_date, 'YYYYMMDD') || '-' || ord_idx;

      INSERT INTO orders (
        order_number, order_date, delivery_date, shipping_cost, subtotal_amount, total_amount,
        buyer_id, buyer_name, buyer_phone, buyer_address,
        recipient_id, recipient_name, recipient_phone, recipient_address,
        delivery_method_id, payment_method_id, order_status_id
      ) VALUES (
        onum, ord_date, del_date, ship_cost, sub, tot,
        bid, 'seed buyer', ph, addr,
        rid, 'seed buyer', ph, addr,
        1 + (var_idx % 2), 1 + (var_idx % 4), 3
      ) RETURNING id INTO oid;
      INSERT INTO order_items (order_id, item_id, item_name, item_price, quantity)
      VALUES (oid, iid, iname, iprice, qty);
    END LOOP;
  END LOOP;
END $$;
