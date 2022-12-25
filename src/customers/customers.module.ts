import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { VouchersService } from 'src/voucher/vouchers.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, PrismaService, VouchersService],
  exports: [CustomersService],
})
export class CustomersModule {}
