import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { BaseService } from 'src/base/base.service';
import { ApiResponse } from 'src/shared/responses/ApiResponse';
import { RefreshToken } from './entities/RefreshToken.entity';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: RefreshToken,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.model.findByIdAndUpdate(
        userId,
        { refreshToken: refreshToken },
        { new: true },
      );

      if (!user) {
        return ApiResponse.empty();
      }

      return ApiResponse.item(user);
    } catch (error) {
      throw new BadRequestException(
        `Error updating refresh token: ${error.message}`,
      );
    }
  }

  async findOneByRefreshToken(token: string): Promise<ApiResponse<User>> {
    return this.findOne({
      'refreshToken.token': token,
      'refreshToken.revoked': false,
    });
  }

  async revokeRefreshToken(userId: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.model.findByIdAndUpdate(
        userId,
        { 'refreshToken.revoked': true },
        { new: true },
      );

      if (!user) {
        return ApiResponse.empty();
      }

      return ApiResponse.item(user);
    } catch (error) {
      throw new BadRequestException(
        `Error revoking refresh token: ${error.message}`,
      );
    }
  }
}
