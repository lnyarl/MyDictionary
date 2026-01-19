import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { PaginationDto } from "@shared";
import { AdminRole } from "../admin-users/entities/admin-user.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("users")
  async getUsers(@Query() paginationDto: PaginationDto) {
    return this.usersService.getUsers(paginationDto);
  }

  @Get("users/:id")
  async getUser(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }

  @Post("users")
  @Roles(AdminRole.DEVELOPER)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post("users/dummy")
  @Roles(AdminRole.DEVELOPER)
  async createDummyUser() {
    return this.usersService.createDummyUser();
  }
}
