const DB_ID = process.env.NOTION_CERTS_DB_ID || 'acd7c0ce-eb11-44a5-8ad6-56cbe3c59732'
const NOTION_API_KEY = process.env.NOTION_API_KEY || ''

export async function getCerts() {
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      sorts: [{ property: 'Order', direction: 'ascending' }],
    }),
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`)

  const data = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.results.map((page: any) => {
    const p = page.properties
    return {
      id: page.id,
      name: p.Name?.title?.[0]?.plain_text || 'Unnamed',
      provider: p.Provider?.select?.name || '',
      status: p.Status?.select?.name || 'Not Started',
      estTime: p['Est Time']?.rich_text?.[0]?.plain_text || '',
      fields: p.Fields?.multi_select?.map((f: { name: string }) => f.name) || [],
      link: p.Link?.url || '',
      order: p.Order?.number || 999,
    }
  })
}
