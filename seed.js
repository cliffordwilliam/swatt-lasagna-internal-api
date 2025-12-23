import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { itemsTable } from './dist/db/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function seed() {
  console.log('Seeding database...');

  await db.insert(itemsTable)
    .values([
      { item_name: 'Lasagna Mini', price: 65000 },
      { item_name: 'Lasagna Small', price: 95000 },
      { item_name: 'Lasagna Medium', price: 180000 },
      { item_name: 'Lasagna Long', price: 295000 },
      { item_name: 'Lasagna Xtra Medium', price: 395000 },
      { item_name: 'Lasagna Family', price: 495000 },
      { item_name: 'Lasagna Xtra Family', price: 555000 },
      { item_name: 'Lasagna Party Medium', price: 1350000 },
      { item_name: 'Lasagna Party Large', price: 2750000 },
      { item_name: 'Macaroni Mini', price: 50000 },
      { item_name: 'Macaroni Small', price: 85000 },
      { item_name: 'Macaroni Oval', price: 110000 },
      { item_name: 'Macaroni Medium', price: 165000 },
      { item_name: 'Macaroni Long', price: 250000 },
      { item_name: 'Macaroni Xtra Medium', price: 335000 },
      { item_name: 'Macaroni Family', price: 380000 },
      { item_name: 'Macaroni Xtra Family', price: 445000 },
      { item_name: 'Macaroni Party Medium', price: 1100000 },
      { item_name: 'Macaroni Party Large', price: 2200000 },
      { item_name: 'Marmer Cake 1 Loyang Bulat', price: 335000 },
      { item_name: 'Marmer Cake 1 Loyang Dipotong', price: 335000 },
      { item_name: 'Marmer Cake 1 Slice', price: 22000 },
      { item_name: 'Marmer Cake 3 Slice', price: 63000 },
      { item_name: 'Marmer Cake 6 Slice', price: 125000 },
      { item_name: 'Marmer Cake 9 Slice', price: 185000 },
      { item_name: 'Marmer Cake 12 Slice', price: 245000 },
      { item_name: 'Nastar Bulat', price: 185000 },
      { item_name: 'Nastar Kotak', price: 135000 },
      { item_name: 'Kue Keju Bulat', price: 195000 },
      { item_name: 'Kue Keju Kotak', price: 145000 },
      { item_name: 'Lidah Kucing Bulat', price: 150000 },
      { item_name: 'Lidah Kucing Kotak', price: 120000 },
      { item_name: 'Sagu Keju Bulat', price: 150000 },
      { item_name: 'Sagu Keju Kotak', price: 120000 },
      { item_name: 'Almond Keju Bulat', price: 185000 },
      { item_name: 'Almond Keju Kotak', price: 135000 },
      { item_name: 'Cheese Stick Kotak', price: 160000 },
      { item_name: 'Bolu Peuyeum 1 Slice', price: 11000 },
      { item_name: 'Bolu Peuyeum 5 Slice', price: 50000 },
      { item_name: 'Bolu Peuyeum 12 Slice', price: 110000 },
      { item_name: 'Bolu Peuyeum 1 Loyang Utuh', price: 140000 },
      { item_name: 'Roti Baso', price: 15000 },
      { item_name: 'Roti Keju', price: 15000 },
      { item_name: 'Roti Coklat', price: 15000 },
      { item_name: 'Pudding 1 Cup', price: 30000 },
      { item_name: 'Pudding 4 Cup', price: 115000 },
      { item_name: 'Pudding 6 Cup', price: 172500 },
      { item_name: 'Box Hampers Box K3', price: 75000 },
      { item_name: 'Box Hampers Box K4', price: 95000 },
      { item_name: 'Box Hampers Box B3', price: 85000 },
      { item_name: 'Box Hampers Box B4', price: 95000 },
      { item_name: 'Tas Kain MC', price: 15000 },
      { item_name: 'Tas Kain K3', price: 15000 },
      { item_name: 'Tas Kain K4', price: 15000 },
      { item_name: 'Tas Kain B3', price: 15000 },
      { item_name: 'Tas Kain B4', price: 15000 },
      { item_name: 'Hampers Marmer Cake', price: 350000 },
    ])
    .onConflictDoNothing();

  console.log('Seed completed');
}

seed()
  .then(async () => {
    await client.end();
  })
  .catch(async (err) => {
    console.error('Seed failed:', err);
    await client.end();
    process.exit(1);
  });