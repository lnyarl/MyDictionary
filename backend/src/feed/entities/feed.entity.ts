import { Definition } from "@stashy/shared";
import { User } from "../../users/entities/user.entity";
import { Word } from "../../words/entities/word.entity";

// 당장엔 좀 큰데, 나중에 나누는게 좋을 듯
export type Feed = Definition & User & Word & { termNumber: number };
