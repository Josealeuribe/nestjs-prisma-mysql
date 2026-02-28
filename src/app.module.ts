import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ExistenciasModule } from './modules/existencias/existencias.module';
import { ComprasModule } from './modules/compras/compras.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [PrismaModule, ExistenciasModule, ComprasModule, VentasModule, ConfiguracionModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
