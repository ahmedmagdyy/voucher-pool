import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../common/services/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { VouchersService } from './vouchers.service';

const mockedPrismaService = {
  customer: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};

describe('VoucherService', () => {
  let service: VouchersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockedPrismaService,
        },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
