import { useStoryblokApi } from '@storyblok/astro'

// https://www.storyblok.com/docs/api/content-delivery/v2#core-resources/datasources/datasources
export async function getDataSources() {
  try {
    const storyblokApi = useStoryblokApi()
    const result = await storyblokApi.get(`cdn/datasources`)
    const datasources = result?.data?.datasources || undefined
    return datasources
  } catch (error) {
    console.log(error.message || error.toString())
    return undefined
  }
}

// https://www.storyblok.com/docs/api/content-delivery/v2#core-resources/datasource-entries/datasource-entries
export async function getDataSourceEntries(datasourceIdOrSlug, { dimension } = {}) {
  try {
    const storyblokApi = useStoryblokApi()
    const result = await storyblokApi.get(`cdn/datasource_entries`, {
      datasource: datasourceIdOrSlug,
      dimension,
    })
    const entries = result?.data?.datasource_entries || undefined
    return entries
  } catch (error) {
    console.log(error.message || error.toString())
    return undefined
  }
}

export async function getDataSourceEntriesByName(datasourceIdOrSlug, { dimension } = {}) {
  const entries = await getDataSourceEntries(datasourceIdOrSlug, { dimension })
  const entriesByName = entries.reduce((acc, entry) => {
    acc[entry.name] = entry
    return acc
  }, {})
  return entriesByName
}
