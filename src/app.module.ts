import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExistenciasModule } from './modules/existencias/existencias.module';
import { ComprasModule } from './modules/compras/compras.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { PermisosModule } from './modules/permisos/permisos.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { TipoDocumentoModule } from './modules/tipo-documento/tipo-documento.module';
import { TipoProveedorModule } from './modules/tipo-proveedor/tipo-proveedor.module';
import { MunicipioModule } from './modules/municipios/municipio.module';
import { TerminoPagoModule } from './modules/termino-pago/termino-pago.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ para leer .env (JWT_SECRET, etc.)
    PrismaModule,
    AuthModule,
    ExistenciasModule,
    ComprasModule,
    VentasModule,
    ConfiguracionModule,
    UsuariosModule,
    PermisosModule,
    CatalogosModule,
    TipoDocumentoModule,
    TipoProveedorModule,
    MunicipioModule,
    TerminoPagoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
