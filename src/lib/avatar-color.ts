const avatarColorPalette = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-slate-100 text-slate-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-gray-100 text-gray-700",
];

export function getAvatarColorClasses(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return avatarColorPalette[hash % avatarColorPalette.length];
}
