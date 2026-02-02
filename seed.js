import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error("DATABASE_URL is not set");
	process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function seed() {
	console.log("Seeding database...");

	await sql`
    INSERT INTO items (name, price) VALUES
      ('lasagna mini', 65000),
      ('lasagna small', 95000),
      ('lasagna medium', 180000),
      ('lasagna long', 295000),
      ('lasagna xtra medium', 395000),
      ('lasagna family', 495000),
      ('lasagna xtra family', 555000),
      ('lasagna party medium', 1350000),
      ('lasagna party large', 2750000),
      ('macaroni mini', 50000),
      ('macaroni small', 85000),
      ('macaroni oval', 110000),
      ('macaroni medium', 165000),
      ('macaroni long', 250000),
      ('macaroni xtra medium', 335000),
      ('macaroni family', 380000),
      ('macaroni xtra family', 445000),
      ('macaroni party medium', 1100000),
      ('macaroni party large', 2200000),
      ('marmer cake 1 loyang bulat', 335000),
      ('marmer cake 1 loyang dipotong', 335000),
      ('marmer cake 1 slice', 22000),
      ('marmer cake 3 slice', 63000),
      ('marmer cake 6 slice', 125000),
      ('marmer cake 9 slice', 185000),
      ('marmer cake 12 slice', 245000),
      ('nastar bulat', 185000),
      ('nastar kotak', 135000),
      ('kue keju bulat', 195000),
      ('kue keju kotak', 145000),
      ('lidah kucing bulat', 150000),
      ('lidah kucing kotak', 120000),
      ('sagu keju bulat', 150000),
      ('sagu keju kotak', 120000),
      ('almond keju bulat', 185000),
      ('almond keju kotak', 135000),
      ('cheese stick kotak', 160000),
      ('bolu peuyeum 1 slice', 11000),
      ('bolu peuyeum 5 slice', 50000),
      ('bolu peuyeum 12 slice', 110000),
      ('bolu peuyeum 1 loyang utuh', 140000),
      ('roti baso', 15000),
      ('roti keju', 15000),
      ('roti coklat', 15000),
      ('pudding 1 cup', 30000),
      ('pudding 4 cup', 115000),
      ('pudding 6 cup', 172500),
      ('box hampers box k3', 75000),
      ('box hampers box k4', 95000),
      ('box hampers box b3', 85000),
      ('box hampers box b4', 95000),
      ('tas kain mc', 15000),
      ('tas kain k3', 15000),
      ('tas kain k4', 15000),
      ('tas kain b3', 15000),
      ('tas kain b4', 15000),
      ('hampers marmer cake', 350000);
  `;

	console.log("Seed completed");
}

try {
	await seed();
} catch (err) {
	console.error("Seed failed:", err);
	process.exit(1);
} finally {
	await sql.end();
}
