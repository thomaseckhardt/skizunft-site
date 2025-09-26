import slugifyModule from 'slugify';

export const slugify = (str: string | undefined) =>
  str
    ? slugifyModule(str, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'en-US',
        trim: true,
      })
    : undefined;
