import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateRecordDto, @Request() req: any) {
    return this.recordsService.create(dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  findAll(@Query() query: any) {
    return this.recordsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRecordDto) {
    return this.recordsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.recordsService.remove(id);
  }
}