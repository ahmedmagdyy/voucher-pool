import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @ApiResponse({
    status: 200,
    description: 'The record found.',
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Returns customer working voucher codes.',
  })
  @Get(':id/codes')
  findCustomerVoucherCodes(
    @Param('id') id: string,
    @Query('active') active: string,
  ) {
    return this.customersService.findCustomerCodes(id, active === 'true');
  }
}
