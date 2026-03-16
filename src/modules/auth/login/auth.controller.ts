import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { SolicitarRestablecimientoDto } from '../dto/solicitar-restablecimiento.dto';
import { RestablecerContrasenaService } from '../restablecer-contrasena.service';
import { ActualizarMiPerfilDto } from '../dto/actualizar-mi-perfil.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const profileUploadPath = join(process.cwd(), 'uploads', 'perfiles');

function ensureUploadDir() {
  if (!existsSync(profileUploadPath)) {
    mkdirSync(profileUploadPath, { recursive: true });
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly restablecerContrasenaService: RestablecerContrasenaService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.service.login(dto.email, dto.contrasena);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: any) {
    return this.service.getMe(req.user.id_usuario);
  }

  @Post('solicitar-restablecimiento')
  async solicitarRestablecimiento(
    @Body() dto: SolicitarRestablecimientoDto,
  ) {
    return this.restablecerContrasenaService.solicitarRestablecimiento(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mi-perfil')
  async miPerfil(@Req() req: any) {
    return this.service.getMe(req.user.id_usuario);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('mi-perfil')
  async actualizarMiPerfil(
    @Req() req: any,
    @Body() dto: ActualizarMiPerfilDto,
  ) {
    return this.service.actualizarMiPerfil(req.user.id_usuario, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('mi-perfil/foto')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, profileUploadPath);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `perfil-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  async subirFotoPerfil(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debes subir una imagen JPG, PNG o WEBP menor a 5MB',
      );
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/perfiles/${file.filename}`;

    return this.service.actualizarFotoPerfil(req.user.id_usuario, imageUrl);
  }
}