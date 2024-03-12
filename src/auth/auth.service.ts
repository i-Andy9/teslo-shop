import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('ProductService')

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ){}


  async create(CreateUserDto: CreateUserDto){
    try {
      const {password, ...userData} = CreateUserDto
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password,10)
      })

      await this.userRepository.save(user);
      delete user.password

      // TODO: retornar JWT token
      return user
    } catch (error) {
      this.handleDBException(error)
    }
  }

  async login(LoginUserDto: LoginUserDto) {
    const {password, email} = LoginUserDto

    const user = await this.userRepository.findOne({
      where: {email},
      select: { email: true, password: true, id: true}
    })

    if (!user) throw new NotFoundException(`Credential are not valid ${email}`)
    if( !bcrypt.compareSync(password,user.password) ) throw new NotFoundException(`Credential are no valid password`)

    return {...user, token: this.getJWT({id: user.id})}
    //TODO: return JWT
  }

  async checkAuthStatus(user : User){
    return {
      ...user,
      token: this.getJWT({id: user.id})
    }
  }

  private getJWT(payload: JwtPayload){
    const token = this.jwtService.sign(payload)
    return token
  }

  handleDBException(error: any) {
    // console.log('error', error)
    if( error.code === '23505')
        throw new BadRequestException(error.detail)
      this.logger.error(error)
      throw new InternalServerErrorException(`error ayudaa`);
  }
}
