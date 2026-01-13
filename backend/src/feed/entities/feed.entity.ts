import { Definition } from "src/definitions/entities/definition.entity";
import { Word } from "src/words/entities/word.entity";
import { User } from "../../users/entities/user.entity";

// 당장엔 좀 큰데, 나중에 나누는게 좋을 듯
export type Feed = Definition & User & Word;
