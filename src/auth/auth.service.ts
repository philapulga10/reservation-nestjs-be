import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '@/auth/jwt-payload.interface';

import { User } from '@/database/schema';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
