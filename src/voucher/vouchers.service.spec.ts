import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { PrismaService } from '../common/services/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { VouchersService } from './vouchers.service';

const codes = [
  {
    id: '41055bd9-b434-49f3-93f8-6e7d4e95c2ef',
    code: 'BxhtB4Ps',
    redeemedAt: null,
    expiresAt: '2022-12-26T00:00:00.000Z',
    discountPercentage: 15,
    customerId: 'c68ee042-672a-4639-9485-3297638d02ac',
    version: 0,
    createdAt: '2022-12-25T04:36:11.223Z',
    updateAt: '2022-12-25T04:36:11.223Z',
  },
  {
    id: '94a479f5-bf20-4f33-b498-59c1fbab404c',
    code: 'FErqcPlR',
    redeemedAt: null,
    expiresAt: '2022-12-27T00:00:00.000Z',
    discountPercentage: 15,
    customerId: '94dddbb4-8649-403e-8a8a-b5a306e1ab09',
    version: 0,
    createdAt: '2022-12-25T04:50:37.298Z',
    updateAt: '2022-12-25T04:50:37.298Z',
  },
  {
    id: '34fc0126-cc17-4035-b0c9-fe36394c146f',
    code: 'winter2022',
    redeemedAt: '2022-12-28T04:21:48.717Z',
    expiresAt: '2022-12-30T04:21:48.717Z',
    discountPercentage: 15,
    customerId: 'c68ee042-672a-4639-9485-3297638d02ac',
    version: 1,
    createdAt: '2022-12-25T04:22:02.206Z',
    updateAt: '2022-12-25T04:22:02.206Z',
  },
  {
    id: '128b45a8-20f9-4e2b-9557-90dd1e2c66e8',
    code: 'DEC2022',
    redeemedAt: '2022-12-24T04:21:48.717Z',
    expiresAt: '2022-12-30T04:21:48.717Z',
    discountPercentage: 15,
    customerId: 'c68ee042-672a-4639-9485-3297638d02ac',
    version: 1,
    createdAt: '2022-12-25T04:22:02.206Z',
    updateAt: '2022-12-25T04:22:02.206Z',
  },
];

const mockedPrismaService = {
  customer: {
    findOne: jest.fn(),
  },
  voucherCode: {
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

  describe('findOne', () => {
    it('should throw error voucher not found', async () => {
      const id = randomUUID();

      prisma.voucherCode.findUnique = jest.fn().mockReturnValue(null);
      try {
        await service.findOne(id);
      } catch (error) {
        expect(error.message).toEqual('voucher not found!');
      }
    });

    it('should return voucher code data', async () => {
      const expectedResult = {
        id: '41055bd9-b434-49f3-93f8-6e7d4e95c2ef',
        code: 'BxhtB4Ps',
        redeemedAt: null,
        expiresAt: '2022-12-26T00:00:00.000Z',
        discountPercentage: 15,
        customerId: 'c68ee042-672a-4639-9485-3297638d02ac',
        version: 0,
        createdAt: '2022-12-25T04:36:11.223Z',
        updateAt: '2022-12-25T04:36:11.223Z',
      };
      prisma.voucherCode.findUnique = jest.fn().mockReturnValue(expectedResult);
      expect(await service.findOne(expectedResult.id)).toStrictEqual(
        expectedResult,
      );
    });
  });

  describe('findAll', () => {
    it('should return all voucher codes for all users', async () => {
      prisma.voucherCode.findMany = jest.fn().mockReturnValue(codes);
      expect(await service.findAll()).toStrictEqual(codes);
    });

    it('should return working voucher code for specific user', async () => {
      const expectedResult = {
        id: '41055bd9-b434-49f3-93f8-6e7d4e95c2ef',
        code: 'BxhtB4Ps',
        redeemedAt: null,
        expiresAt: '2022-12-26T00:00:00.000Z',
        discountPercentage: 15,
        customerId: 'c68ee042-672a-4639-9485-3297638d02ac',
        version: 0,
        createdAt: '2022-12-25T04:36:11.223Z',
        updateAt: '2022-12-25T04:36:11.223Z',
      };
      prisma.voucherCode.findMany = jest.fn().mockReturnValue(expectedResult);
      expect(
        await service.findAllByCustomerId(expectedResult.customerId, false),
      ).toStrictEqual(expectedResult);
    });

    it('should return redeemed voucher code for specific user', async () => {
      const expectedResult = {
        id: '34fc0126-cc17-4035-b0c9-fe36394c146f',
        code: 'winter2022',
        redeemedAt: '2022-12-28T04:21:48.717Z',
        expiresAt: '2022-12-30T04:21:48.717Z',
        discountPercentage: 15,
        customerId: 'c68ee042-672a-4639-9485-3297638d02ac',
        version: 1,
        createdAt: '2022-12-25T04:22:02.206Z',
        updateAt: '2022-12-25T04:22:02.206Z',
      };
      prisma.voucherCode.findMany = jest.fn().mockReturnValue(expectedResult);
      expect(
        await service.findAllByCustomerId(expectedResult.customerId, false),
      ).toStrictEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should throw error customer not found', async () => {
      const id = randomUUID();
      prisma.customer.findUnique = jest.fn().mockReturnValue(null);
      try {
        await service.create({
          code: 'xxxx',
          customerId: id,
          discountPercentage: 15,
          expiresAt: '2022-12-26T00:00:00.000Z',
        });
      } catch (error) {
        expect(error.message).toEqual('customer not found!');
      }
    });

    it('should throw error You have voucher with the same code', async () => {
      prisma.customer.findUnique = jest.fn().mockReturnValue({
        id: codes[0].customerId,
        name: 'customer',
        email: 'customer@me.test',
      });
      prisma.voucherCode.findFirst = jest.fn().mockReturnValue(codes[0]);
      try {
        await service.create({
          code: codes[0].code,
          customerId: codes[0].customerId,
          discountPercentage: 20,
          expiresAt: '2022-12-26T00:00:00.000Z',
        });
      } catch (error) {
        expect(error.message).toEqual('You have voucher with the same code');
      }
    });

    it('should create voucher code and return it', async () => {
      const expectedData = {
        id: randomUUID(),
        code: 'xxxxx',
        customerId: codes[0].customerId,
        discountPercentage: 20,
        expiresAt: '2022-12-26T00:00:00.000Z',
        redeemedAt: null,
        version: 0,
        createdAt: '2022-12-25T04:36:11.223Z',
        updateAt: '2022-12-25T04:36:11.223Z',
      };
      prisma.customer.findUnique = jest.fn().mockReturnValue({
        id: codes[0].customerId,
        name: 'customer',
        email: 'customer@me.test',
      });
      prisma.voucherCode.findFirst = jest.fn().mockReturnValue(null);
      prisma.voucherCode.create = jest.fn().mockReturnValue(expectedData);

      expect(
        await service.create({
          code: 'xxxxx',
          customerId: codes[0].customerId,
          discountPercentage: 20,
          expiresAt: '2022-12-26T00:00:00.000Z',
        }),
      ).toStrictEqual(expectedData);
    });
  });

  describe('createMany', () => {
    it('should throw error customer not found', async () => {
      const id = randomUUID();
      prisma.customer.findUnique = jest.fn().mockReturnValue(null);
      try {
        await service.createMany({
          customerId: id,
          discountPercentage: 15,
          expiresAt: '2022-12-26T00:00:00.000Z',
          codeLength: 8,
          count: 2,
        });
      } catch (error) {
        expect(error.message).toEqual('customer not found!');
      }
    });

    it('should create many voucher code and return them', async () => {
      const expectedData = [
        {
          id: randomUUID(),
          code: 'xxxxx',
          customerId: codes[0].customerId,
          discountPercentage: 20,
          expiresAt: '2022-12-26T00:00:00.000Z',
          redeemedAt: null,
          version: 0,
          createdAt: '2022-12-25T04:36:11.223Z',
          updateAt: '2022-12-25T04:36:11.223Z',
        },
        {
          id: randomUUID(),
          code: 'AAAAA',
          customerId: codes[0].customerId,
          discountPercentage: 20,
          expiresAt: '2022-12-26T00:00:00.000Z',
          redeemedAt: null,
          version: 0,
          createdAt: '2022-12-25T04:36:11.223Z',
          updateAt: '2022-12-25T04:36:11.223Z',
        },
      ];
      prisma.customer.findUnique = jest.fn().mockReturnValue({
        id: codes[0].customerId,
        name: 'customer',
        email: 'customer@me.test',
      });
      prisma.voucherCode.findFirst = jest.fn().mockReturnValue(null);
      prisma.voucherCode.create = jest.fn().mockReturnValue(expectedData[0]);

      const result = await service.createMany({
        customerId: codes[0].customerId,
        discountPercentage: 20,
        expiresAt: '2022-12-26T00:00:00.000Z',
        codeLength: 8,
        count: 2,
      });
      expect(result[0]).toStrictEqual(expectedData[0]);
    });
  });

  describe('useCode', () => {
    it('should throw error code not found!', async () => {
      const id = randomUUID();
      prisma.voucherCode.findUnique = jest.fn().mockReturnValue(null);
      try {
        await service.useCode(id);
      } catch (error) {
        expect(error.message).toEqual('voucher not found!');
      }
    });

    it('should throw error code limit reached!', async () => {
      prisma.voucherCode.findUnique = jest.fn().mockReturnValue(codes[3]);
      try {
        await service.useCode(codes[3].id);
      } catch (error) {
        expect(error.message).toEqual('code limit reached!');
      }
    });

    it('should throw error code expired!', async () => {
      const id = randomUUID();
      prisma.voucherCode.findUnique = jest.fn().mockReturnValue({
        expiresAt: '2022-12-24T00:00:00.000Z',
      });
      try {
        await service.useCode(id);
      } catch (error) {
        expect(error.message).toEqual('code expired!');
      }
    });

    it('should redeem code and update redeemed at and verion', async () => {
      const expectedResult = {
        id: '41055bd9-b434-49f3-93f8-6e7d4e95c2ef',
        code: 'BxhtB4Ps',
        redeemedAt: new Date().toISOString(),
        expiresAt: '2022-12-26T00:00:00.000Z',
        discountPercentage: 15,
        customerId: 'c68ee042-672a-4639-9485-3297638d02ac',
        version: 1,
        createdAt: '2022-12-25T04:36:11.223Z',
        updateAt: '2022-12-25T04:36:11.223Z',
      };
      prisma.voucherCode.findUnique = jest.fn().mockReturnValue(codes[0]);
      prisma.voucherCode.update = jest.fn().mockReturnValue(expectedResult);

      const result = await service.useCode(codes[0].id);
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
