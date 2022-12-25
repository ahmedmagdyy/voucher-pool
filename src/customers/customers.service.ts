import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCustomerDto: CreateCustomerDto) {
    const { email, name } = createCustomerDto;
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
