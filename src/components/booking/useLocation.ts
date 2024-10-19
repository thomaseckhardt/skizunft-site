import { useState, useEffect } from 'react'

const useLocation = () => {
  const [location, setLocation] = useState({
    search: window.location.search,
  })

  useEffect(() => {
    const handleLocationChange = () => {
      setLocation({
        search: window.location.search,
      })
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('pushstate', handleLocationChange)
    window.addEventListener('replacestate', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('pushstate', handleLocationChange)
      window.removeEventListener('replacestate', handleLocationChange)
    }
  }, [])

  return location
}

export default useLocation
