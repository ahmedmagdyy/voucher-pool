import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { VouchersService } from '../voucher/vouchers.service';
import { PrismaService } from '../common/services/prisma.service';
import { ICreateCustomer } from './interfaces/create-customer.interface';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => VouchersService))
    private readonly vouchersService: VouchersService,
  ) {}

  async create(createCustomerData: ICreateCustomer) {
    const { email, name } = createCustomerData;
    const customerExistsByEmail = await this.findByEmail(email);
    if (customerExistsByEmail) {
      throw new HttpException('email already exists!', HttpStatus.BAD_REQUEST);
    }
    return this.prismaService.customer.create({
      data: {
        email,
        name,
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        id,
      },
    });
    if (!customer) {
      throw new HttpException('customer not found!', HttpStatus.NOT_FOUND);
    }
    return customer;
  }

  async findCustomerCodes(id: string, active = true) {
    const customerExists = await this.findOne(id);
    if (!customerExists) {
      throw new HttpException('customer not found!', HttpStatus.NOT_FOUND);
    }
    return this.vouchersService.findAllByCustomerId(id, active);
  }

  private async findByEmail(
    email: string,
  ): Promise<Prisma.Prisma__CustomerClient<Customer, never>> {
    return this.prismaService.customer.findUnique({
      where: {
        email,
      },
    });
  }
}
