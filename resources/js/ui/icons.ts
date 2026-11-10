/** Icon set: 16×16 viewBox, drawn with a 1.25 stroke in the current text colour. */
export const ICONS = {
  search: '<circle cx="7.25" cy="7.25" r="4.75"/><path d="m10.75 10.75 3 3"/>',
  close: '<path d="m4 4 8 8M12 4l-8 8"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  'chevron-left': '<path d="M9.75 3.5 5.25 8l4.5 4.5"/>',
  'chevron-right': '<path d="M6.25 3.5 10.75 8l-4.5 4.5"/>',
  home: '<path d="M2.5 7.25 8 2.5l5.5 4.75v5.25a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z"/><path d="M6.25 13.5v-4h3.5v4"/>',
  calendar:
    '<rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.75h11M5.5 2v2.5M10.5 2v2.5"/>',
  bell: '<path d="M4 11.5V7.25a4 4 0 0 1 8 0v4.25"/><path d="M2.75 11.5h10.5M6.75 13.5h2.5"/>',
  sidebar: '<rect x="2.5" y="3" width="11" height="10" rx="1.5"/><path d="M6.25 3v10"/>',
  grid: '<rect x="2.75" y="2.75" width="10.5" height="10.5" rx="1.5"/><path d="M8 2.75v10.5M2.75 8h10.5"/>',
  edit: '<path d="m3 13 .6-2.9 7-7a1.4 1.4 0 0 1 2 2l-7 7z"/><path d="M9.5 4.25l2 2"/>',
  trash:
    '<path d="M3 4.5h10M6.25 4.5V3h3.5v1.5M4.25 4.5l.5 8a1 1 0 0 0 1 1h4.5a1 1 0 0 0 1-1l.5-8"/>',
  check: '<path d="m3.5 8.5 3 3 6-7"/>',
  undo: '<path d="M5.5 3.5 2.75 6.25 5.5 9"/><path d="M2.75 6.25h6.5a3.5 3.5 0 0 1 0 7h-3"/>',
  alert: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5.25v3.25M8 10.75v.01"/>',
} as const;

export type IconName = keyof typeof ICONS;
