import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { PrismaService } from '../common/services/prisma.service';
import { CustomersService } from './customers.service';

const mockedPrismaService = {
  customer: {
    findUnique: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  },
};

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockedPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return customer by id', async () => {
      const expectedCustomer = {
        id: randomUUID(),
        name: 'Test cusomter #1',
        email: 'testcustomer@test.com',
      };
      prisma.customer.findUnique = jest.fn().mockReturnValue(expectedCustomer);
      expect(await service.findOne(expectedCustomer.id)).toStrictEqual(
        expectedCustomer,
      );
    });

    it('should return customer not found', async () => {
      const id = randomUUID();

      prisma.customer.findUnique = jest.fn().mockReturnValue(null);
      try {
        await service.findOne(id);
      } catch (error) {
        expect(error.message).toEqual('customer not found!');
      }
    });
  });

  describe('create', () => {
    it("should create customer and return it's data", async () => {
      const customerData = {
        name: 'Majed',
        email: 'majed@test.com',
      };
      prisma.customer.findUnique = jest.fn().mockReturnValue(null);
      prisma.customer.create = jest.fn().mockReturnValue({
        ...customerData,
        id: randomUUID(),
      });
      const resultCustomer = await service.create(customerData);
      expect(resultCustomer).toHaveProperty('id');
      expect(resultCustomer).toHaveProperty('name');
      expect(resultCustomer.name).toEqual(customerData.name);
      expect(resultCustomer.email).toEqual(customerData.email);
    });

    it('should throw error email already exists when using same email', async () => {
      const customerData = {
        name: 'Majed',
        email: 'majed@test.com',
      };
      prisma.customer.findUnique = jest.fn().mockReturnValue({
        ...customerData,
        id: randomUUID(),
      });
      try {
        await service.create(customerData);
      } catch (error) {
        expect(error.message).toEqual('email already exists!');
      }
    });
  });
});
