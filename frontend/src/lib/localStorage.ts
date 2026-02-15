type Item<T> = {
  value: T;
  expiredAt?: string;
};

export const getItem = <T>(key: string) => {
  const result = localStorage.getItem(key);
  try {
    if (result !== null) {
      const item = JSON.parse(result) as Item<T>;
      return item.value;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const setItem = <T>(key: string, value: T, expiredAt?: Date) => {
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
  const removeKeys: string[] = [];
  for (let i = 0; localStorage.key(i) !== null; i++) {
    const key = localStorage.key(i)!;
    try {
      const value = getItem<{ expiredAt?: string }>(key);
      if (!value?.expiredAt) {
        continue;
      }

      if (new Date(value.expiredAt).getTime() < now) {
        removeKeys.push(key);
      }
    } catch {
      // ignore. json parsing때에 에러가 나는데, json이 아닌 다른 데이터가 있을 수 있다.
    }
  }

  for (const key of removeKeys) {
    removeItem(key);
  }
};

export const removeItem = (key: string) => {
  localStorage.removeItem(key);
};
