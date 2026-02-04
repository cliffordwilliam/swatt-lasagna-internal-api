import type { Sql } from "postgres";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnprocessableEntityError,
} from "../../lib/errors.js";
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
	OrderItemInput,
	OrderItemInsert,
	OrderItemValues,
	OrderListRow,
	OrderRow,
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

	async createOrder(orderData: CreateOrderInput): Promise<OrderRow> {
		this._validateOrderDates(orderData.order_date, orderData.delivery_date);
		this._validateNoDuplicateItems(orderData.items);

		return await this.db.begin(async (sql) => {
			await sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
			await sql`SET LOCAL statement_timeout = '30s'`;

			await this._validateOrderNumberUniqueness(sql, orderData.order_number);

			const {
				buyer,
				recipient,
				buyerPhone,
				buyerAddress,
				recipientPhone,
				recipientAddress,
				subtotalAmount,
				totalAmount,
				itemsToInsert,
			} = await this._prepareOrderTransaction(sql, orderData);

			const insertedOrder = await this.repo.insertOrder(sql, orderData, {
				buyerId: buyer.id,
				buyerName: buyer.name,
				buyerPhone: buyerPhone.phone_number,
				buyerAddress: buyerAddress.address,
				recipientId: recipient.id,
				recipientName: recipient.name,
				recipientPhone: recipientPhone.phone_number,
				recipientAddress: recipientAddress.address,
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

	async putOrder(
		orderData: CreateOrderInput,
		orderId: number,
	): Promise<OrderRow> {
		this._validateOrderDates(orderData.order_date, orderData.delivery_date);
		this._validateNoDuplicateItems(orderData.items);

		return await this.db.begin(async (sql) => {
			await sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
			await sql`SET LOCAL statement_timeout = '30s'`;

			await this._validateOrderExists(sql, orderId);
			await this._validateOrderNumberUniqueness(
				sql,
				orderData.order_number,
				orderId,
			);

			const {
				buyer,
				recipient,
				buyerPhone,
				buyerAddress,
				recipientPhone,
				recipientAddress,
				subtotalAmount,
				totalAmount,
				itemsToInsert,
			} = await this._prepareOrderTransaction(sql, orderData);

			const updatedOrder = await this.repo.updateOrder(
				sql,
				orderId,
				orderData,
				{
					buyerId: buyer.id,
					buyerName: buyer.name,
					buyerPhone: buyerPhone.phone_number,
					buyerAddress: buyerAddress.address,
					recipientId: recipient.id,
					recipientName: recipient.name,
					recipientPhone: recipientPhone.phone_number,
					recipientAddress: recipientAddress.address,
					subtotalAmount,
					totalAmount,
				},
			);

			await this.repo.deleteOrderItems(sql, orderId);

			const finalItems: OrderItemInsert[] = itemsToInsert.map((item) => ({
				...item,
				order_id: updatedOrder.id,
			}));
			await this.repo.insertOrderItems(sql, finalItems);

			return updatedOrder;
		});
	}

	async getAllOrders(): Promise<OrderListRow[]> {
		return await this.repo.getAllOrders(this.db);
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
		const existingOrder = await this.repo.getOrderById(sql, orderId);
		if (!existingOrder) {
			throw new NotFoundError(`Order with id ${orderId} not found`);
		}
	}

	private async _validateDeliveryMethod(
		sql: Sql,
		deliveryMethodId: number,
	): Promise<void> {
		const deliveryMethod = await this.deliveryMethodRepo.getDeliveryMethodById(
			sql,
			deliveryMethodId,
		);
		if (!deliveryMethod) {
			throw new NotFoundError(
				`Delivery method with id ${deliveryMethodId} not found`,
			);
		}
	}

	private async _validatePaymentMethod(
		sql: Sql,
		paymentMethodId: number,
	): Promise<void> {
		const paymentMethod = await this.paymentMethodRepo.getPaymentMethodById(
			sql,
			paymentMethodId,
		);
		if (!paymentMethod) {
			throw new NotFoundError(
				`Payment method with id ${paymentMethodId} not found`,
			);
		}
	}

	private async _validateOrderStatus(
		sql: Sql,
		orderStatusId: number,
	): Promise<void> {
		const orderStatus = await this.orderStatusRepo.getOrderStatusById(
			sql,
			orderStatusId,
		);
		if (!orderStatus) {
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
		const existingOrder = await this.repo.getOrderNumber(sql, orderNumber);
		if (existingOrder) {
			if (currentOrderId === undefined || existingOrder.id !== currentOrderId) {
				throw new ConflictError(
					`Order with number ${orderNumber} already exists`,
				);
			}
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
				// Could happen if concurrent deletion happens
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

	// Concurrent operations handling:
	// - Item/DeliveryMethod/PaymentMethod/OrderStatus deletion during order create/update
	//   will cause NotFoundError - acceptable as these are rare admin operations
	// - Item price changes during order entry will use the price at query time
	//   (historical pricing snapshot) - this is intentional
	// - Multiple employees creating/updating the SAME order simultaneously is not handled
	//   but is extremely unlikely in our phone-order workflow (one call = one order)
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
