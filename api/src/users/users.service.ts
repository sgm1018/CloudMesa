import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      new Types.ObjectId(userId),
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

  async updatatePublicKey(userId: string, key : string){
    try {
      const user = await this.model.findByIdAndUpdate(
        new Types.ObjectId(userId),
        { publicKey: key },
        { new: true },
      );

      if (!user) {
        return ApiResponse.empty();
      }

      return ApiResponse.item(user);
    } catch (error) {
      throw new BadRequestException(
        `Error updating public key: ${error.message}`,
      );
    }
  }

  //TODO check this refresh toke, dont work correctly
  async findOneByRefreshToken(userId: string, token: string): Promise<ApiResponse<User>> {
    return this.  findOne({
      _id: new Types.ObjectId(userId),
      'refreshToken.token': token,
      'refreshToken.revoked': false,
    });
  }

  async revokeRefreshToken(userId: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.model.findByIdAndUpdate(
        new Types.ObjectId(userId),
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
