export interface MenuOption {
  key: string;
  label: string;
  run: () => Promise<void> | void;
}