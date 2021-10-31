export type Mode = 'production' | 'development';

const MODES: Record<Mode, true> = {
  production: true,
  development: true,
};
function isMode(input: unknown): input is Mode {
  return Object.keys(MODES).includes(input as Mode);
}
export const mode = isMode(process.env.MODE) ? process.env.MODE : 'production';
