import { event } from '@convoy/event';

import { Order } from './entities';

@event.forAggregate(Order)
export class OrderCreatedEvent {}
