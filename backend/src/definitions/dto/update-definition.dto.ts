import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateDefinitionDto } from "./create-definition.dto";

export class UpdateDefinitionDto extends PartialType(
  OmitType(CreateDefinitionDto, ["wordId"] as const),
) {}
