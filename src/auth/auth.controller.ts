import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { GetUser, RawHeaders } from './decorator';
import { RoleProtected } from './decorator/role-protected.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { ValidRoles } from './interfaces';
import { AuthDecorator } from './decorator/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  createUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  loginUser(
    @Body() LoginUserDto: LoginUserDto
  ){
    return this.authService.login(LoginUserDto)
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') getEmail: string,
    @RawHeaders() rawHeaders: string[]
  ){
    return {
      ok:true,
      msg: 'wena wena',
      user,
      getEmail,
      rawHeaders
    }
  }

  @Get('check-auth-status')
  @AuthDecorator()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user)
  }

  @Get('private2')
  // @SetMetadata('roles',['admin','super-user'])   //forma fea
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards( AuthGuard(), UserRoleGuard ) //(autenticacion,autorizacion)
  privateRoute2(
    @GetUser() user:User
  ){
    console.log('aqui')
    return {
      ok:true,
      user,

    }
  }
  @Get('private3')
  // @SetMetadata('roles',['admin','super-user'])   //forma fea
  // new custom decorator
  // @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  // @UseGuards( AuthGuard(), UserRoleGuard ) //(autenticacion,autorizacion)
  @AuthDecorator()
  privateRoute3(
    @GetUser() user:User
  ){
    console.log('aqui')
    return {
      ok:true,
      user,

    }
  }
}
