import type { Sql } from "postgres";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnprocessableEntityError,
} from "../../lib/errors.js";
import { OrderRepository } from "./order-repository.js";
import type {
	AddressRow,
	CreateOrderInput,
	OrderItemInput,
	OrderItemInsert,
	OrderRow,
	PersonRow,
	PhoneRow,
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
				throw new NotFoundError(`Person with id ${personInput.id} not found`);
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
	): Promise<PhoneRow | null> {
		if (!phoneInput) return null;

		if (phoneInput.id !== undefined) {
			const phone = await this.repo.getPhoneById(sql, phoneInput.id);
			if (!phone) {
				throw new NotFoundError(`Phone with id ${phoneInput.id} not found`);
			}
			if (phone.person_id !== personId) {
				throw new ConflictError(
					`Phone with id ${phoneInput.id} does not belong to person ${personId}`,
				);
			}
			return phone;
		}
		if (phoneInput.value) {
			return await this.repo.createPhone(sql, personId, phoneInput.value);
		}
		throw new BadRequestError(
			"Either phone id or phone value must be provided",
		);
	}

	private async resolveAddress(
		sql: Sql,
		personId: number,
		addressInput: { id?: number; value?: string } | undefined,
	): Promise<AddressRow | null> {
		if (!addressInput) return null;

		if (addressInput.id !== undefined) {
			const address = await this.repo.getAddressById(sql, addressInput.id);
			if (!address) {
				throw new NotFoundError(`Address with id ${addressInput.id} not found`);
			}
			if (address.person_id !== personId) {
				throw new ConflictError(
					`Address with id ${addressInput.id} does not belong to person ${personId}`,
				);
			}
			return address;
		}
		if (addressInput.value) {
			return await this.repo.createAddress(sql, personId, addressInput.value);
		}
		throw new BadRequestError(
			"Either address id or address value must be provided",
		);
	}

	private validateOrderDates(orderDate: string, deliveryDate: string): void {
		if (new Date(deliveryDate) < new Date(orderDate)) {
			throw new UnprocessableEntityError(
				"delivery_date must be greater than or equal to order_date",
			);
		}
	}

	private validateNoDuplicateItems(items: OrderItemInput[]): void {
		const itemIds = items.map((i) => i.item_id);
		const uniqueItemIds = new Set(itemIds);

		if (uniqueItemIds.size !== itemIds.length) {
			throw new BadRequestError("Duplicate item_id values are not allowed");
		}
	}

	async createOrder(orderData: CreateOrderInput): Promise<OrderRow> {
		this.validateOrderDates(orderData.order_date, orderData.delivery_date);
		this.validateNoDuplicateItems(orderData.items);

		// Concurrent deletion/update is possible, tradeoff for real time state
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
						throw new NotFoundError(
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
				buyerPhone: buyerPhone?.phone_number ?? null,
				buyerAddress: buyerAddress?.address ?? null,
				recipientId: recipient.id,
				recipientName: recipient.name,
				recipientPhone: recipientPhone?.phone_number ?? null,
				recipientAddress: recipientAddress?.address ?? null,
				subtotalAmount,
				totalAmount,
			});

			const finalItems: OrderItemInsert[] = itemsToInsert.map((item) => ({
				...item,
				order_id: insertedOrder.id,
			}));
			await this.repo.insertOrderItems(sql, finalItems);

			return insertedOrder;
		});
	}
}
