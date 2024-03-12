import { AuthGuard } from "@nestjs/passport";
import { ValidRoles } from "../interfaces";
import { RoleProtected } from "./role-protected.decorator";
import { UseGuards, applyDecorators } from "@nestjs/common";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";

export function AuthDecorator (...roles: ValidRoles[]){

    return applyDecorators(
        RoleProtected(...roles),
        UseGuards( AuthGuard(), UserRoleGuard),
    )
}