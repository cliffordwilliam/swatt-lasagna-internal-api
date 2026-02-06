import type { Sql } from "postgres";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnprocessableEntityError,
} from "../../lib/errors.js";
import { normalizeNameForDb } from "../../lib/string-utils.js";
import { AddressRepository } from "../addresses/address-repository.js";
import type { AddressSummaryRow as AddressRow } from "../addresses/address-schema.js";
import { DeliveryMethodRepository } from "../delivery-methods/delivery-method-repository.js";
import { ItemRepository } from "../items/item-repository.js";
import { OrderStatusRepository } from "../order-statuses/order-status-repository.js";
import { PaymentMethodRepository } from "../payment-methods/payment-method-repository.js";
import { PersonRepository } from "../persons/person-repository.js";
import type { PersonRow } from "../persons/person-schema.js";
import { PhoneRepository } from "../phones/phone-repository.js";
import type { PhoneSummaryRow as PhoneRow } from "../phones/phone-schema.js";
import { OrderRepository } from "./order-repository.js";
import type {
	CreateOrderInput,
	GetOrderResponse,
	GetOrderWithRelatedDataRow,
	ListOrdersQuery,
	OrderItemInput,
	OrderItemInsert,
	OrderItemValues,
	OrderListRow,
	PreparedOrderData,
} from "./order-schema.js";

export class OrderService {
	private repo = new OrderRepository();
	private itemRepo = new ItemRepository();
	private personRepo = new PersonRepository();
	private phoneRepo = new PhoneRepository();
	private addressRepo = new AddressRepository();
	private deliveryMethodRepo = new DeliveryMethodRepository();
	private paymentMethodRepo = new PaymentMethodRepository();
	private orderStatusRepo = new OrderStatusRepository();

	constructor(private db: Sql) {}

	async createOrder(orderData: CreateOrderInput): Promise<void> {
		this._validateOrderDates(orderData.order_date, orderData.delivery_date);
		this._validateNoDuplicateItems(orderData.items);

		orderData = {
			...orderData,
			order_number: normalizeNameForDb(orderData.order_number),
		};

		return await this.db.begin(async (sql) => {
			await sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
			await sql`SET LOCAL statement_timeout = '30s'`;

			await this._validateOrderNumberUniqueness(sql, orderData.order_number);

			const PreparedOrderData = await this._prepareOrderTransaction(
				sql,
				orderData,
			);

			const insertedOrder = await this.repo.insertOrder(
				sql,
				orderData,
				PreparedOrderData,
			);

			const finalItems: OrderItemInsert[] = PreparedOrderData.itemsToInsert.map(
				(item) => ({
					...item,
					order_id: insertedOrder.id,
				}),
			);
			await this.repo.insertOrderItems(sql, finalItems);
		});
	}

	async putOrder(orderData: CreateOrderInput, orderId: number): Promise<void> {
		this._validateOrderDates(orderData.order_date, orderData.delivery_date);
		this._validateNoDuplicateItems(orderData.items);

		orderData = {
			...orderData,
			order_number: normalizeNameForDb(orderData.order_number),
		};

		await this.db.begin(async (sql) => {
			await sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
			await sql`SET LOCAL statement_timeout = '30s'`;

			await this._validateOrderExists(sql, orderId);
			await this._validateOrderNumberUniqueness(
				sql,
				orderData.order_number,
				orderId,
			);

			const PreparedOrderData = await this._prepareOrderTransaction(
				sql,
				orderData,
			);

			await this.repo.updateOrder(sql, orderId, orderData, PreparedOrderData);

			await this.repo.deleteOrderItems(sql, orderId);

			const finalItems: OrderItemInsert[] = PreparedOrderData.itemsToInsert.map(
				(item) => ({
					...item,
					order_id: orderId,
				}),
			);
			await this.repo.insertOrderItems(sql, finalItems);
		});
	}

	async getAllOrders(filters: ListOrdersQuery = {}): Promise<OrderListRow[]> {
		return await this.repo.getAllOrders(this.db, filters);
	}

	async getOrderById(orderId: number): Promise<GetOrderResponse> {
		const [orderRow, items] = await Promise.all([
			this.repo.getOrderWithRelatedDataById(this.db, orderId),
			this.repo.getOrderItemsByOrderId(this.db, orderId),
		]);
		if (!orderRow) {
			throw new NotFoundError(`Order with id ${orderId} not found`);
		}
		return this._rowToGetOrderResponse({ ...orderRow, items });
	}

	private _rowToGetOrderResponse(
		row: GetOrderWithRelatedDataRow,
	): GetOrderResponse {
		return {
			order_number: row.order_number,
			order_date: row.order_date.toISOString(),
			delivery_date: row.delivery_date.toISOString(),
			buyer: {
				id: row.buyer_id,
				name: row.buyer_name,
				phone: {
					id: row.buyer_phone_id,
					phone_number: row.buyer_phone_number,
				},
				address: {
					id: row.buyer_address_id,
					address: row.buyer_address_value,
				},
			},
			recipient: {
				id: row.recipient_id,
				name: row.recipient_name,
				phone: {
					id: row.recipient_phone_id,
					phone_number: row.recipient_phone_number,
				},
				address: {
					id: row.recipient_address_id,
					address: row.recipient_address_value,
				},
			},
			delivery_method_id: row.delivery_method_id,
			payment_method_id: row.payment_method_id,
			order_status_id: row.order_status_id,
			shipping_cost: row.shipping_cost,
			note: row.note ?? undefined,
			items: row.items.map((item) => ({
				item_id: item.item_id,
				item_name: item.item_name,
				item_price: item.item_price,
				quantity: item.quantity,
			})),
		};
	}

	private async _getPerson(
		sql: Sql,
		personInput: { id: number },
	): Promise<PersonRow> {
		const person = await this.personRepo.getPersonById(sql, personInput.id);
		if (!person) {
			throw new NotFoundError(`Person with id ${personInput.id} not found`);
		}
		return person;
	}

	private async _getPhone(
		sql: Sql,
		personId: number,
		phoneInput: { id: number },
	): Promise<PhoneRow> {
		const phone = await this.phoneRepo.getPhoneById(sql, phoneInput.id);
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

	private async _getAddress(
		sql: Sql,
		personId: number,
		addressInput: { id: number },
	): Promise<AddressRow> {
		const address = await this.addressRepo.getAddressById(sql, addressInput.id);
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

	private _validateOrderDates(orderDate: string, deliveryDate: string): void {
		if (new Date(deliveryDate) < new Date(orderDate)) {
			throw new UnprocessableEntityError(
				"delivery_date must be greater than or equal to order_date",
			);
		}
	}

	private _validateNoDuplicateItems(items: OrderItemInput[]): void {
		const itemIds = items.map((i) => i.item_id);
		const uniqueItemIds = new Set(itemIds);

		if (uniqueItemIds.size !== itemIds.length) {
			throw new BadRequestError("Duplicate item_id values are not allowed");
		}
	}

	private async _validateOrderExists(sql: Sql, orderId: number): Promise<void> {
		const exists = await this.repo.orderExists(sql, orderId);
		if (!exists) {
			throw new NotFoundError(`Order with id ${orderId} not found`);
		}
	}

	private async _validateDeliveryMethod(
		sql: Sql,
		deliveryMethodId: number,
	): Promise<void> {
		const deliveryMethodExists =
			await this.deliveryMethodRepo.deliveryMethodExists(sql, deliveryMethodId);
		if (!deliveryMethodExists) {
			throw new NotFoundError(
				`Delivery method with id ${deliveryMethodId} not found`,
			);
		}
	}

	private async _validatePaymentMethod(
		sql: Sql,
		paymentMethodId: number,
	): Promise<void> {
		const exists = await this.paymentMethodRepo.paymentMethodExists(
			sql,
			paymentMethodId,
		);
		if (!exists) {
			throw new NotFoundError(
				`Payment method with id ${paymentMethodId} not found`,
			);
		}
	}

	private async _validateOrderStatus(
		sql: Sql,
		orderStatusId: number,
	): Promise<void> {
		const exists = await this.orderStatusRepo.orderStatusExists(
			sql,
			orderStatusId,
		);
		if (!exists) {
			throw new NotFoundError(
				`Order status with id ${orderStatusId} not found`,
			);
		}
	}

	private async _validateOrderNumberUniqueness(
		sql: Sql,
		orderNumber: string,
		currentOrderId?: number,
	): Promise<void> {
		const exists = await this.repo.orderNumberExists(
			sql,
			orderNumber,
			currentOrderId,
		);
		if (exists) {
			throw new ConflictError(
				`Order with number ${orderNumber} already exists`,
			);
		}
	}

	private async _calculateSubtotalAmount(
		sql: Sql,
		items: OrderItemInput[],
	): Promise<{ subtotalAmount: number; itemsToInsert: OrderItemValues[] }> {
		const itemIds = items.map((i) => i.item_id);
		const foundItems = await this.itemRepo.getItemsByIds(sql, itemIds);
		const itemMap = new Map(foundItems.map((m) => [m.id, m]));

		let subtotalAmount = 0;
		const itemsToInsert: OrderItemValues[] = items.map((reqItem) => {
			const item = itemMap.get(reqItem.item_id);
			if (!item) {
				throw new NotFoundError(`Item with id ${reqItem.item_id} not found`);
			}
			subtotalAmount += item.price * reqItem.quantity;
			return {
				item_id: item.id,
				item_name: item.name,
				item_price: item.price,
				quantity: reqItem.quantity,
			};
		});
		return { subtotalAmount, itemsToInsert };
	}

	private async _prepareOrderTransaction(
		sql: Sql,
		orderData: CreateOrderInput,
	): Promise<PreparedOrderData> {
		await this._validateDeliveryMethod(sql, orderData.delivery_method_id);
		await this._validatePaymentMethod(sql, orderData.payment_method_id);
		await this._validateOrderStatus(sql, orderData.order_status_id);

		const [buyer, recipient] = await Promise.all([
			this._getPerson(sql, orderData.buyer),
			this._getPerson(sql, orderData.recipient),
		]);

		const [buyerPhone, buyerAddress, recipientPhone, recipientAddress] =
			await Promise.all([
				this._getPhone(sql, buyer.id, orderData.buyer.phone),
				this._getAddress(sql, buyer.id, orderData.buyer.address),
				this._getPhone(sql, recipient.id, orderData.recipient.phone),
				this._getAddress(sql, recipient.id, orderData.recipient.address),
			]);

		const { subtotalAmount, itemsToInsert } =
			await this._calculateSubtotalAmount(sql, orderData.items);

		const totalAmount = subtotalAmount + orderData.shipping_cost;

		return {
			buyer,
			recipient,
			buyerPhone,
			buyerAddress,
			recipientPhone,
			recipientAddress,
			subtotalAmount,
			totalAmount,
			itemsToInsert,
		};
	}
}
