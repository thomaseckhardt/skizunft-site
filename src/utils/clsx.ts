import clsx__, { type ClassValue } from 'clsx';

export default function clsx(...inputs: ClassValue[]): string | undefined {
  const value = clsx__(...inputs);

  return value === '' ? undefined : value;
}
