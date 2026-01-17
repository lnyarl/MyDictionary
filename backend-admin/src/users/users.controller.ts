import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { PaginationDto } from "@shared";
import { AdminRole } from "../admin-users/entities/admin-user.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() paginationDto: PaginationDto) {
    return this.usersService.getUsers(paginationDto);
  }

  @Post()
  @Roles(AdminRole.DEVELOPER)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
}
