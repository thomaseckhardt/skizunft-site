import { NAMESPACE } from '@/constants';
import { useStoryblokApi } from '@storyblok/astro';
import { getStoryblokVersion } from '@/utils/env';
import { DEFAULT_LOCALE, LOCALES } from '@/constants';
import { getInternalProductionUrl } from '@/utils/link';

type Paths = Path[];

type Path = {
  props: {
    locale: string;
    slug: string | undefined;
  };
  params: {
    slug: string | undefined;
  };
};

export default async function generateStaticPaths() {
  const storyblokApi = useStoryblokApi();
  const links = await storyblokApi.getAll('cdn/links', {
    version: getStoryblokVersion(),
    starts_with: NAMESPACE,
  });
  const paths: Paths = [];
  console.log('links', links);
  links
    .filter((link) => !link.is_folder)
    .filter((link) => link.slug !== `${NAMESPACE}/global`)
    .forEach((link: { slug: string }) => {
      console.log('LOCALES', LOCALES);
      LOCALES.forEach((locale) => {
        //This slug will be used for fetching data from storyblok
        // regex to remove trailing slash if exists
        const slug = link.slug.replace(/\/$/, '');
        //This will be used for generating all the urls for astro
        const full_url = locale === DEFAULT_LOCALE ? slug : `${locale}/${slug ?? ''}`;
        //This will let us change the url for diffrent versions
        const pathObj = {
          props: { locale: locale, slug },
          params: {
            slug: full_url === '' ? undefined : getInternalProductionUrl(full_url) || undefined,
          },
        };
        paths.push(pathObj);
      });
    });
  console.log('paths', paths);
  return paths;
}
