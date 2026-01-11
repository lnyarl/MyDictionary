/**
 * 랜덤 닉네임 생성 유틸리티 함수
 * 8자의 무작위 문자열 생성 (영문 대소문자 + 숫자)
 */
export function generateRandomNickname(): string {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";

	for (let i = 0; i < 8; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}

	return result;
}

/**
 * 닉네임 유효성 검증 함수
 * - 최소 2자, 최대 20자
 * - 영문, 한글, 숫자, 밑줄(_), 하이픈(-) 허용
 */
export function isValidNickname(nickname: string): boolean {
	if (!nickname || nickname.length < 2 || nickname.length > 20) {
		return false;
	}

	const nicknameRegex = /^[a-zA-Z0-9가-힣_-]+$/;
	return nicknameRegex.test(nickname);
}
