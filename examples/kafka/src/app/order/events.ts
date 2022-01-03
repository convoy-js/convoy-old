import { event } from '@convoy/event';

import { Order } from './entities';

@event.name('order-created').forAggregate(Order)
export class OrderCreatedEvent {}
