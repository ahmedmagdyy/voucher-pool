import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { generate } from 'voucher-code-generator';
import { PrismaService } from '../common/services/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { CreateManyVoucherDto } from './dto/create-many-voucher.dto';
@Injectable()
export class VouchersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => CustomersService))
    private readonly customerService: CustomersService,
  ) {}

  async create(createVoucherDto: CreateVoucherDto) {
    const { code, customerId, discountPercentage } = createVoucherDto;
    const customerExists = await this.customerService.findOne(customerId);
    if (!customerExists) {
      throw new HttpException('customer not found!', HttpStatus.NOT_FOUND);
    }

    const codeExistsForCustomer =
      await this.prismaService.voucherCode.findFirst({
        where: {
          code,
          customerId,
        },
      });
    if (codeExistsForCustomer) {
      throw new HttpException(
        'You have voucher with the same code',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.insertVoucher(code, discountPercentage, customerId);
  }

  async createMany(createManyVoucherDto: CreateManyVoucherDto) {
    const { customerId, codeLength, count, discountPercentage } =
      createManyVoucherDto;
    const customerExists = await this.customerService.findOne(customerId);
    if (!customerExists) {
      throw new HttpException('customer not found!', HttpStatus.NOT_FOUND);
    }

    const generatedCodes = [];
    const codes = this.generateVoucherCode(codeLength, count);
    for (const code of codes) {
      const createdCode = await this.insertVoucher(
        code,
        discountPercentage,
        customerId,
      );

      generatedCodes.push(createdCode);
    }
    return generatedCodes;
  }

  insertVoucher(code: string, discountPercentage: number, customerId: string) {
    return this.prismaService.voucherCode.create({
      data: {
        code,
        discountPercentage,
        customer: {
          connect: {
            id: customerId,
          },
        },
      },
    });
  }

  findAll() {
    return this.prismaService.voucherCode.findMany();
  }

  findAllByCustomerId(customerId: string, active = true) {
    return this.prismaService.voucherCode.findMany({
      where: {
        customerId,
        ...(active
          ? {
              redeemedAt: null,
              version: 0,
            }
          : {
              version: {
                gt: 0,
              },
            }),
      },
    });
  }

  async findOne(id: string) {
    const code = await this.prismaService.voucherCode.findUnique({
      where: {
        id,
      },
    });

    if (!code) {
      throw new HttpException('voucher not found!', HttpStatus.NOT_FOUND);
    }

    return code;
  }

  async useCode(id: string) {
    const codeExists = await this.findOne(id);
    if (!codeExists) {
      throw new HttpException('code not found!', HttpStatus.NOT_FOUND);
    }

    if (codeExists.version > 0) {
      throw new HttpException('code limit reached!', HttpStatus.BAD_REQUEST);
    }

    return this.prismaService.voucherCode.update({
      where: {
        id,
      },
      data: {
        version: 1,
        redeemedAt: new Date(),
      },
    });
  }

  private generateVoucherCode(length: number, count: number): string[] {
    return generate({
      count,
      length,
    });
  }
}
