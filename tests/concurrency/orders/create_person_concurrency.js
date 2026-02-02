const API_BASE_URL = "http://localhost:3000";

const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
const uniqueBuyerPhone = `12345678${uniqueId.substring(0, 2)}`;
const uniqueRecipientPhone = `09876543${uniqueId.substring(0, 2)}`;
const uniqueBuyerName = `Test Buyer Concurrency ${uniqueId}`;
const uniqueRecipientName = `Test Recipient Concurrency ${uniqueId}`;

const payload = {
	order_number: `CONCURRENCY_PERSON_TEST_${uniqueId}`,
	order_date: new Date().toISOString(),
	delivery_date: new Date(Date.now() + 86400000).toISOString(),
	buyer: {
		name: uniqueBuyerName,
		phone: { value: uniqueBuyerPhone },
		address: { value: "123 Concurrency Street" },
	},
	recipient: {
		name: uniqueRecipientName,
		phone: { value: uniqueRecipientPhone },
		address: { value: "456 Concurrency Avenue" },
	},
	delivery_method_id: 1,
	payment_method_id: 1,
	order_status_id: 1,
	shipping_cost: 1000,
	note: "Concurrency test order for person creation",
	items: [{ item_id: 1, quantity: 2 }],
};

async function createOrder() {
	try {
		console.log(
			`Sending request for order with buyer phone: ${payload.buyer.phone.value}`,
		);
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
				`Error creating order (Status: ${response.status}) for buyer phone ${payload.buyer.phone.value}:`,
				data,
			);
		} else {
			console.log(
				`Order created successfully for buyer phone ${payload.buyer.phone.value}:`,
				data,
			);
		}
		return { status: response.status, data };
	} catch (error) {
		console.error(
			`Failed to create order for buyer phone ${payload.buyer.phone.value}:`,
			error,
		);
		return { status: 500, data: { message: error.message } };
	}
}

async function runConcurrencyTest() {
	console.log(
		"Running two concurrent create order requests with the same new buyer/recipient...",
	);
	const [result1, result2] = await Promise.all([createOrder(), createOrder()]);

	console.log("\n--- Concurrency Test Results ---");
	console.log("Request 1 result:", result1);
	console.log("Request 2 result:", result2);

	let successCount = 0;
	let failureCount = 0;

	if (result1.status === 201) {
		successCount++;
	} else {
		failureCount++;
	}

	if (result2.status === 201) {
		successCount++;
	} else {
		failureCount++;
	}

	if (successCount === 1 && failureCount === 1) {
		console.log(
			"SUCCESS: One request succeeded and one failed, which is the expected behavior for concurrent creation of a unique person.",
		);
		if (
			(result1.status === 409 || result1.status === 400) &&
			result2.status === 201
		) {
			console.log(
				"The failed request (Request 1) returned an expected conflict/bad request status.",
			);
		} else if (
			(result2.status === 409 || result2.status === 400) &&
			result1.status === 201
		) {
			console.log(
				"The failed request (Request 2) returned an expected conflict/bad request status.",
			);
		} else {
			console.log(
				"WARNING: One request succeeded and one failed, but the failure status code was not 400 or 409. Please investigate.",
			);
		}
	} else if (successCount === 2) {
		console.log(
			"FAILURE: Both requests succeeded. This indicates a lack of proper concurrency handling for unique person creation, potentially leading to duplicate entries.",
		);
	} else if (failureCount === 2) {
		console.log(
			"FAILURE: Both requests failed. This might indicate an issue with the API or the test setup, or an unexpected error during person creation.",
		);
	} else {
		console.log(
			"UNEXPECTED RESULT: The concurrency test yielded an unexpected combination of success and failure. Please investigate.",
		);
	}
	console.log(
		"Please check your database to verify the outcome of these concurrent requests.",
	);
}

runConcurrencyTest();
