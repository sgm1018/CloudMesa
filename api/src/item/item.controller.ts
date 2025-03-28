import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { FilesService } from './item.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoginGuard } from 'src/auth/guards/login.guard';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // @Public()
  // @Post()
  // create(@Body() fileDto: ) {

  // }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('user')
  @Get(':id')
  findOne(@Param('id') id: string) {

  }

  @UseGuards(LoginGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {

  }
}