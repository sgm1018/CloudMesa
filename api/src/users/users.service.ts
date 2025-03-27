import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { BaseService } from 'src/base/base.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel);
  }
}