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
      { itemName: 'Lasagna Mini', price: 65000 },
      { itemName: 'Lasagna Small', price: 95000 },
      { itemName: 'Lasagna Medium', price: 180000 },
      { itemName: 'Lasagna Long', price: 295000 },
      { itemName: 'Lasagna Xtra Medium', price: 395000 },
      { itemName: 'Lasagna Family', price: 495000 },
      { itemName: 'Lasagna Xtra Family', price: 555000 },
      { itemName: 'Lasagna Party Medium', price: 1350000 },
      { itemName: 'Lasagna Party Large', price: 2750000 },
      { itemName: 'Macaroni Mini', price: 50000 },
      { itemName: 'Macaroni Small', price: 85000 },
      { itemName: 'Macaroni Oval', price: 110000 },
      { itemName: 'Macaroni Medium', price: 165000 },
      { itemName: 'Macaroni Long', price: 250000 },
      { itemName: 'Macaroni Xtra Medium', price: 335000 },
      { itemName: 'Macaroni Family', price: 380000 },
      { itemName: 'Macaroni Xtra Family', price: 445000 },
      { itemName: 'Macaroni Party Medium', price: 1100000 },
      { itemName: 'Macaroni Party Large', price: 2200000 },
      { itemName: 'Marmer Cake 1 Loyang Bulat', price: 335000 },
      { itemName: 'Marmer Cake 1 Loyang Dipotong', price: 335000 },
      { itemName: 'Marmer Cake 1 Slice', price: 22000 },
      { itemName: 'Marmer Cake 3 Slice', price: 63000 },
      { itemName: 'Marmer Cake 6 Slice', price: 125000 },
      { itemName: 'Marmer Cake 9 Slice', price: 185000 },
      { itemName: 'Marmer Cake 12 Slice', price: 245000 },
      { itemName: 'Nastar Bulat', price: 185000 },
      { itemName: 'Nastar Kotak', price: 135000 },
      { itemName: 'Kue Keju Bulat', price: 195000 },
      { itemName: 'Kue Keju Kotak', price: 145000 },
      { itemName: 'Lidah Kucing Bulat', price: 150000 },
      { itemName: 'Lidah Kucing Kotak', price: 120000 },
      { itemName: 'Sagu Keju Bulat', price: 150000 },
      { itemName: 'Sagu Keju Kotak', price: 120000 },
      { itemName: 'Almond Keju Bulat', price: 185000 },
      { itemName: 'Almond Keju Kotak', price: 135000 },
      { itemName: 'Cheese Stick Kotak', price: 160000 },
      { itemName: 'Bolu Peuyeum 1 Slice', price: 11000 },
      { itemName: 'Bolu Peuyeum 5 Slice', price: 50000 },
      { itemName: 'Bolu Peuyeum 12 Slice', price: 110000 },
      { itemName: 'Bolu Peuyeum 1 Loyang Utuh', price: 140000 },
      { itemName: 'Roti Baso', price: 15000 },
      { itemName: 'Roti Keju', price: 15000 },
      { itemName: 'Roti Coklat', price: 15000 },
      { itemName: 'Pudding 1 Cup', price: 30000 },
      { itemName: 'Pudding 4 Cup', price: 115000 },
      { itemName: 'Pudding 6 Cup', price: 172500 },
      { itemName: 'Box Hampers Box K3', price: 75000 },
      { itemName: 'Box Hampers Box K4', price: 95000 },
      { itemName: 'Box Hampers Box B3', price: 85000 },
      { itemName: 'Box Hampers Box B4', price: 95000 },
      { itemName: 'Tas Kain MC', price: 15000 },
      { itemName: 'Tas Kain K3', price: 15000 },
      { itemName: 'Tas Kain K4', price: 15000 },
      { itemName: 'Tas Kain B3', price: 15000 },
      { itemName: 'Tas Kain B4', price: 15000 },
      { itemName: 'Hampers Marmer Cake', price: 350000 },
    ]);

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