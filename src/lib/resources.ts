export async function getUploadedResources() {
    try {
      const response = await fetch('/api/resources', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
  
      return await response.json()
    } catch (error) {
      console.error('Error fetching resources:', error)
      return []
    }
  }