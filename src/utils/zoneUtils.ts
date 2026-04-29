const STATE_DEFAULT_ZONE: Record<string, string> = {
  'Alabama': '8a', 'Alaska': '3b', 'Arizona': '9b', 'Arkansas': '7b',
  'California': '9b', 'Colorado': '5b', 'Connecticut': '6b', 'Delaware': '7a',
  'Florida': '9b', 'Georgia': '8a', 'Hawaii': '12a', 'Idaho': '6a',
  'Illinois': '5b', 'Indiana': '5b', 'Iowa': '5a', 'Kansas': '6a',
  'Kentucky': '6b', 'Louisiana': '9a', 'Maine': '5a', 'Maryland': '7a',
  'Massachusetts': '6a', 'Michigan': '5b', 'Minnesota': '4b', 'Mississippi': '8a',
  'Missouri': '6a', 'Montana': '5b', 'Nebraska': '5b', 'Nevada': '8b',
  'New Hampshire': '5b', 'New Jersey': '7a', 'New Mexico': '7a', 'New York': '6a',
  'North Carolina': '7b', 'North Dakota': '4a', 'Ohio': '6a', 'Oklahoma': '7a',
  'Oregon': '8b', 'Pennsylvania': '6a', 'Rhode Island': '6b', 'South Carolina': '8a',
  'South Dakota': '5a', 'Tennessee': '7a', 'Texas': '8b', 'Utah': '7a',
  'Vermont': '5a', 'Virginia': '7a', 'Washington': '8b', 'West Virginia': '6a',
  'Wisconsin': '5a', 'Wyoming': '5b', 'District of Columbia': '7a',
};

export function inferZoneFromState(state: string): string {
  return STATE_DEFAULT_ZONE[state] ?? '6b';
}

export async function lookupZoneFromZip(zip: string): Promise<string | null> {
  try {
    const res = await fetch(`https://phzmapi.com/${zip}.json`);
    if (!res.ok) return null;
    const data = await res.json() as { zone?: string };
    return data.zone ?? null;
  } catch {
    return null;
  }
}
