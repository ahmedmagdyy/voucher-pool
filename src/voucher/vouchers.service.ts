import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { generate } from 'voucher-code-generator';
import { PrismaService } from '../common/services/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { ICreateVoucher } from './interfaces/create-voucher.interface';
import { ICreateManyVoucher } from './interfaces/create-many-voucher.interface';
@Injectable()
export class VouchersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => CustomersService))
    private readonly customerService: CustomersService,
  ) {}

  async create(createVoucherData: ICreateVoucher) {
    const { code, customerId } = createVoucherData;
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

    return this.insertVoucher(createVoucherData);
  }

  async createMany(createManyVoucherData: ICreateManyVoucher) {
    const { customerId, codeLength, count, discountPercentage, expiresAt } =
      createManyVoucherData;
    const customerExists = await this.customerService.findOne(customerId);
    if (!customerExists) {
      throw new HttpException('customer not found!', HttpStatus.NOT_FOUND);
    }

    const generatedCodes = [];
    const codes = this.generateVoucherCode(codeLength, count);
    for (const code of codes) {
      const args = {
        code,
        discountPercentage,
        customerId,
        expiresAt,
      };
      const createdCode = await this.insertVoucher(args);

      generatedCodes.push(createdCode);
    }
    return generatedCodes;
  }

  insertVoucher(data: ICreateVoucher) {
    const { customerId, discountPercentage, expiresAt, code } = data;
    return this.prismaService.voucherCode.create({
      data: {
        code,
        discountPercentage,
        expiresAt,
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
