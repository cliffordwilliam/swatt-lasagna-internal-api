import type { Sql } from "postgres";
import { BadRequestError } from "../../lib/errors.js";
import { OrderRepository } from "./order-repository.js";
import type {
	CreateOrderInput,
	OrderDetailRow,
	OrderItemInsert,
	PersonRow,
} from "./order-schema.js";

export class OrderService {
	private repo = new OrderRepository();

	constructor(private db: Sql) {}

	private async resolvePerson(
		sql: Sql,
		personInput: { id?: number; name?: string },
	): Promise<PersonRow> {
		if (personInput.id !== undefined) {
			const person = await this.repo.getPersonById(sql, personInput.id);
			if (!person) {
				throw new BadRequestError(`Person with id ${personInput.id} not found`);
			}
			return person;
		}
		if (personInput.name) {
			return await this.repo.createPerson(sql, personInput.name);
		}
		throw new BadRequestError(
			"Either person id or person name must be provided",
		);
	}

	private async resolvePhone(
		sql: Sql,
		personId: number,
		phoneInput: { id?: number; value?: string } | undefined,
	): Promise<string | null> {
		if (!phoneInput) return null;

		if (phoneInput.id !== undefined) {
			const phone = await this.repo.getPhoneById(sql, phoneInput.id);
			if (!phone) {
				throw new BadRequestError(`Phone with id ${phoneInput.id} not found`);
			}
			if (phone.person_id !== personId) {
				throw new BadRequestError(
					`Phone with id ${phoneInput.id} does not belong to person ${personId}`,
				);
			}
			return phone.phone_number;
		}
		if (phoneInput.value) {
			await this.repo.createPhone(sql, personId, phoneInput.value);
			return phoneInput.value;
		}
		throw new BadRequestError(
			"Either phone id or phone value must be provided",
		);
	}

	private async resolveAddress(
		sql: Sql,
		personId: number,
		addressInput: { id?: number; value?: string } | undefined,
	): Promise<string | null> {
		if (!addressInput) return null;

		if (addressInput.id !== undefined) {
			const address = await this.repo.getAddressById(sql, addressInput.id);
			if (!address) {
				throw new BadRequestError(
					`Address with id ${addressInput.id} not found`,
				);
			}
			if (address.person_id !== personId) {
				throw new BadRequestError(
					`Address with id ${addressInput.id} does not belong to person ${personId}`,
				);
			}
			return address.address;
		}
		if (addressInput.value) {
			await this.repo.createAddress(sql, personId, addressInput.value);
			return addressInput.value;
		}
		throw new BadRequestError(
			"Either address id or address value must be provided",
		);
	}

	private async createOrderTransaction(
		orderData: CreateOrderInput,
	): Promise<OrderDetailRow> {
		return await this.db.begin(async (sql) => {
			await sql`SET LOCAL statement_timeout = '30s'`;

			const buyer = await this.resolvePerson(sql, orderData.buyer);
			const buyerPhone = await this.resolvePhone(
				sql,
				buyer.id,
				orderData.buyer.phone,
			);
			const buyerAddress = await this.resolveAddress(
				sql,
				buyer.id,
				orderData.buyer.address,
			);

			const recipient = await this.resolvePerson(sql, orderData.recipient);
			const recipientPhone = await this.resolvePhone(
				sql,
				recipient.id,
				orderData.recipient.phone,
			);
			const recipientAddress = await this.resolveAddress(
				sql,
				recipient.id,
				orderData.recipient.address,
			);

			const itemIds = orderData.items.map((i) => i.item_id);
			const items = await this.repo.getItemsByIds(sql, itemIds);
			const itemMap = new Map(items.map((m) => [m.id, m]));

			let subtotalAmount = 0;
			const itemsToInsert: OrderItemInsert[] = orderData.items.map(
				(reqItem) => {
					const item = itemMap.get(reqItem.item_id);
					if (!item) {
						// Could happen if concurrent deletion happens
						throw new BadRequestError(
							`Item with id ${reqItem.item_id} not found`,
						);
					}
					subtotalAmount += item.price * reqItem.quantity;
					return {
						order_id: 0,
						item_id: item.id,
						item_name: item.name,
						item_price: item.price,
						quantity: reqItem.quantity,
					};
				},
			);

			const totalAmount = subtotalAmount + orderData.shipping_cost;

			const insertedOrder = await this.repo.insertOrder(sql, orderData, {
				buyerId: buyer.id,
				buyerName: buyer.name,
				buyerPhone,
				buyerAddress,
				recipientId: recipient.id,
				recipientName: recipient.name,
				recipientPhone,
				recipientAddress,
				subtotalAmount,
				totalAmount,
			});

			const finalItems: OrderItemInsert[] = itemsToInsert.map((item) => ({
				...item,
				order_id: insertedOrder.id,
			}));
			await this.repo.insertOrderItems(sql, finalItems);

			const orderDetail = await this.repo.getOrderDetailById(
				sql,
				insertedOrder.id,
			);
			if (!orderDetail) {
				throw new BadRequestError(
					`Order with id ${insertedOrder.id} not found after insert`,
				);
			}
			return orderDetail;
		});
	}

	// Concurrent deletion/update can happen, its a tradeoff for real time state
	async createOrder(orderData: CreateOrderInput): Promise<OrderDetailRow> {
		return await this.createOrderTransaction(orderData);
	}
}
