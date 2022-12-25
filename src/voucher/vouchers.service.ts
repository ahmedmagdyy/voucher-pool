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
    await this.customerService.findOne(customerId);

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
    const {
      customerId,
      codeLength,
      discountPercentage,
      expiresAt,
      count = 1,
    } = createManyVoucherData;
    await this.customerService.findOne(customerId);

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
        expiresAt: new Date(expiresAt).toISOString(),
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
              expiresAt: {
                gt: new Date(),
              },
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

    if (codeExists.version > 0) {
      throw new HttpException('code limit reached!', HttpStatus.BAD_REQUEST);
    }

    if (new Date() > new Date(codeExists.expiresAt)) {
      throw new HttpException('code expired!', HttpStatus.BAD_REQUEST);
    }

    const updatedCode = await this.prismaService.voucherCode.updateMany({
      where: {
        id,
        version: codeExists.version,
      },
      data: {
        version: {
          increment: 1,
        },
        redeemedAt: new Date(),
      },
    });

    if (updatedCode.count === 0) {
      throw new HttpException('code has been used!', HttpStatus.BAD_REQUEST);
    }
    return this.findOne(id);
  }

  private generateVoucherCode(length: number, count: number): string[] {
    return generate({
      count,
      length,
    });
  }
}
