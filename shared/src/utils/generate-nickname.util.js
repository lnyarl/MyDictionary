"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNickname = generateRandomNickname;
exports.isValidNickname = isValidNickname;
function generateRandomNickname() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}
function isValidNickname(nickname) {
    if (!nickname || nickname.length < 2 || nickname.length > 20) {
        return false;
    }
    const nicknameRegex = /^[a-zA-Z0-9가-힣_-]+$/;
    return nicknameRegex.test(nickname);
}
//# sourceMappingURL=generate-nickname.util.js.map