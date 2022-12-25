import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CustomersService } from 'src/customers/customers.service';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  controllers: [VouchersController],
  providers: [VouchersService, PrismaService, CustomersService],
  exports: [VouchersService],
})
export class VouchersModule {}
