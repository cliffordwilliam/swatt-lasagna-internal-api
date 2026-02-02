const API_BASE_URL = "http://localhost:3000";

const uniqueOrderNumber = `CONCURRENCY_TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const payload = {
	order_number: uniqueOrderNumber,
	order_date: new Date().toISOString(),
	delivery_date: new Date(Date.now() + 86400000).toISOString(),
	buyer: {
		name: "Test Buyer Concurrency",
		phone: { value: "1234567890" },
		address: { value: "123 Concurrency Street" },
	},
	recipient: {
		name: "Test Recipient Concurrency",
		phone: { value: "0987654321" },
		address: { value: "456 Concurrency Avenue" },
	},
	delivery_method_id: 1,
	payment_method_id: 1,
	order_status_id: 1,
	shipping_cost: 1000,
	note: "Concurrency test order",
	items: [{ item_id: 1, quantity: 2 }],
};

async function createOrder() {
	try {
		console.log(`Sending request for order: ${payload.order_number}`);
		const response = await fetch(`${API_BASE_URL}/api/orders`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const data = await response.json();
		if (!response.ok) {
			console.error(
				`Error creating order (Status: ${response.status}) for ${payload.order_number}:`,
				data,
			);
		} else {
			console.log(
				`Order created successfully for ${payload.order_number}:`,
				data,
			);
		}
		return { status: response.status, data };
	} catch (error) {
		console.error(`Failed to create order for ${payload.order_number}:`, error);
		return { status: 500, data: { message: error.message } };
	}
}

async function runConcurrencyTest() {
	console.log(
		"Running two concurrent create order requests with the same payload...",
	);
	const [result1, result2] = await Promise.all([createOrder(), createOrder()]);

	console.log("\n--- Concurrency Test Results ---");
	console.log("Request 1 result:", result1);
	console.log("Request 2 result:", result2);

	if (result1.status === 201 && result2.status === 201) {
		console.log(
			"WARNING: Both requests succeeded. This might indicate a lack of proper concurrency handling, leading to duplicate orders if `order_number` is meant to be unique.",
		);
	} else if (result1.status === 201 || result2.status === 201) {
		console.log(
			"One request succeeded, the other failed (expected behavior if `order_number` is unique).",
		);
	} else {
		console.log("Both requests failed.");
	}
	console.log(
		"Please check your database to verify the outcome of these concurrent requests.",
	);
}

runConcurrencyTest();
