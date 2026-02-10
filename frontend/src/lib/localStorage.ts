type Item = { value: any };

export const getItem = <T>(key: string) => {
  const result = localStorage.getItem(key);
  try {
    if (result !== null) {
      const item = JSON.parse(result) as Item;
      return item.value as T;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const setItem = (key: string, value: any, expiredAt?: Date) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      value,
      expiredAt: expiredAt?.toString(),
    }),
  );
};

export const removeExpiredItem = () => {
  const now = Date.now();
  const removeKey = [];
  for (let i = 0; localStorage.key(i) !== null; i++) {
    const key = localStorage.key(i)!;
    try {
      const value = getItem<{ expiredAt: string }>(key)!;
      if (!value.expiredAt) {
        continue;
      }

      if (new Date(value.expiredAt).getTime() < now) {
        removeKey.push(key);
      }
    } catch {
      // ignore. json parsing때에 에러가 나는데, json이 아닌 다른 데이터가 있을 수 있다.
    }
  }
  for (const key of removeKey) {
    removeItem(key);
  }
};

export const removeItem = (key: string) => {
  localStorage.removeItem(key);
};
