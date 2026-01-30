const API_BASE_URL = 'http://localhost:3000';

const uniqueBuyerName = `CONCURRENCY_BUYER_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

async function createOrder(orderNumber) {
    const payload = {
        order_number: orderNumber,
        order_date: new Date().toISOString(),
        delivery_date: new Date(Date.now() + 86400000).toISOString(),
        buyer: {
            name: uniqueBuyerName,
            phone: { value: "1234567890" },
            address: { value: "123 Buyer Concurrency Street" },
        },
        recipient: {
            name: "Test Recipient Buyer Concurrency",
            phone: { value: "0987654321" },
            address: { value: "456 Buyer Concurrency Avenue" },
        },
        delivery_method_id: 1,
        payment_method_id: 1,
        order_status_id: 1,
        shipping_cost: 1000,
        note: "Buyer concurrency test order",
        items: [
            { item_id: 1, quantity: 1 },
        ],
    };

    try {
        console.log(`Sending request for order: ${payload.order_number} with buyer: ${uniqueBuyerName}`);
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error(`Error creating order (Status: ${response.status}) for ${payload.order_number}:`, data);
        } else {
            console.log(`Order created successfully for ${payload.order_number}. Buyer ID: ${data.buyer_id}`);
        }
        return { status: response.status, data, buyerId: data.buyer_id };
    } catch (error) {
        console.error(`Failed to create order for ${payload.order_number}:`, error);
        return { status: 500, data: { message: error.message }, buyerId: null };
    }
}

async function runConcurrencyTest() {
    console.log(`Running two concurrent create order requests for new buyer: ${uniqueBuyerName}`);

    const orderNumber1 = `BUYER_TEST_1_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderNumber2 = `BUYER_TEST_2_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const [result1, result2] = await Promise.all([
        createOrder(orderNumber1),
        createOrder(orderNumber2),
    ]);

    console.log("\n--- Buyer Concurrency Test Results ---");
    console.log("Request 1 status:", result1.status, "Buyer ID:", result1.buyerId);
    console.log("Request 2 status:", result2.status, "Buyer ID:", result2.buyerId);

    if (result1.status === 201 && result2.status === 201) {
        if (result1.buyerId && result2.buyerId && result1.buyerId === result2.buyerId) {
            console.log("SUCCESS: Both orders created successfully and reused the same buyer (ID: " + result1.buyerId + "). This is the expected behavior.");
        } else {
            console.error("FAILURE: Both orders created successfully but did NOT reuse the same buyer ID. This indicates duplicate buyer creation.");
        }
    } else {
        console.error("FAILURE: One or both order creations failed. This test expects both to succeed, with one buyer being created and reused.");
    }
    console.log("Please check your database to verify the outcome of these concurrent requests for buyer:", uniqueBuyerName);
}

runConcurrencyTest();
