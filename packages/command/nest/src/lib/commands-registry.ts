import type { OnApplicationBootstrap } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { ClassType } from '@deepkit/core';

import { CommandsRegistry } from '@convoy/command';
import {
  InternalMessageConsumer,
  InternalMessageProducer,
} from '@convoy/message';

@Injectable()
export class NestCommandsRegistry
  extends CommandsRegistry
  implements OnApplicationBootstrap
{
  constructor(
    private readonly injector: ModuleRef,
    @Inject(InternalMessageConsumer)
    messageConsumer: InternalMessageConsumer,
    @Inject(InternalMessageProducer)
    messageProducer: InternalMessageProducer,
  ) {
    super(messageConsumer, messageProducer);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.init();
  }

  getInstance<T>(controller: ClassType<T>): T {
    return this.injector.get(controller, {
      strict: false,
    });
  }
}
