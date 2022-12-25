import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApiTags } from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { CreateManyVoucherDto } from './dto/create-many-voucher.dto';

@ApiTags('vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @Post('/generate')
  createMany(@Body() createManyVoucherDto: CreateManyVoucherDto) {
    return this.vouchersService.createMany(createManyVoucherDto);
  }

  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  @Patch(':id/redeem-code')
  redeemCode(@Param('id') id: string) {
    return this.vouchersService.useCode(id);
  }
}
