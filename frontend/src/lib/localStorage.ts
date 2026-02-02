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

export const setItem = (key: string, value: any) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      value,
    }),
  );
};

export const removeItem = (key: string) => {
  localStorage.removeItem(key);
};
