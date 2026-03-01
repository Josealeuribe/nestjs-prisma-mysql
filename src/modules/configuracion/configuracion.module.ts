import { Module } from '@nestjs/common';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class ConfiguracionModule {}
