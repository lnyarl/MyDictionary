export const PASTEL_COLORS = [
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF",
  "#E2F0CB",
  "#FFDAC1",
  "#E0BBE4",
  "#957DAD",
  "#D291BC",
  "#FEC8D8",
  "#FFDFD3",
  "#B5EAD7",
  "#C7CEEA",
  "#F2D2BD",
  "#E6E6FA",
  "#FFF0F5",
  "#F0FFF0",
  "#F5F5DC",
  "#FAF0E6",
  "#FDFD96",
  "#FF6961",
  "#77DD77",
  "#AEC6CF",
  "#CFCFC4",
  "#F49AC2",
  "#CB99C9",
  "#FFD1DC",
  "#DEA5A4",
  "#779ECB",
  "#03C03C",
  "#966FD6",
  "#C23B22",
  "#FF964F",
  "#B39EB5",
  "#FFB7B2",
  "#FF9AA2",
  "#E2F0CB",
  "#B5EAD7",
  "#C7CEEA",
];

export function stringToColor(str: string): string {
  if (!str) return PASTEL_COLORS[0];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}
