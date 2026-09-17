import { ref, computed } from 'vue'

const CITIES = [
  { name: 'New York', tz: 'America/New_York', abbr: 'NYC' },
  { name: 'London', tz: 'Europe/London', abbr: 'LDN' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', abbr: 'TKY' },
  { name: 'Sydney', tz: 'Australia/Sydney', abbr: 'SYD' },
  { name: 'Dubai', tz: 'Asia/Dubai', abbr: 'DXB' },
  { name: 'Paris', tz: 'Europe/Paris', abbr: 'PAR' },
  { name: 'Berlin', tz: 'Europe/Berlin', abbr: 'BER' },
  { name: 'Moscow', tz: 'Europe/Moscow', abbr: 'MSK' },
  { name: 'Mumbai', tz: 'Asia/Kolkata', abbr: 'MUM' },
  { name: 'Singapore', tz: 'Asia/Singapore', abbr: 'SIN' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles', abbr: 'LAX' },
  { name: 'Chicago', tz: 'America/Chicago', abbr: 'CHI' },
  { name: 'São Paulo', tz: 'America/Sao_Paulo', abbr: 'GRU' },
  { name: 'Toronto', tz: 'America/Toronto', abbr: 'YYZ' },
  { name: 'Seoul', tz: 'Asia/Seoul', abbr: 'ICN' },
  { name: 'Hong Kong', tz: 'Asia/Hong_Kong', abbr: 'HKG' },
  { name: 'Cairo', tz: 'Africa/Cairo', abbr: 'CAI' },
  { name: 'Istanbul', tz: 'Europe/Istanbul', abbr: 'IST' },
  { name: 'Shanghai', tz: 'Asia/Shanghai', abbr: 'PVG' },
  { name: 'Johannesburg', tz: 'Africa/Johannesburg', abbr: 'JNB' },
]

function getTimeForZone(tz) {
  try {
    const now = new Date()
    const str = now.toLocaleString('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const dateStr = now.toLocaleString('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    const offset = now.toLocaleString('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).split(' ').pop()

    return { time: str, date: dateStr, offset }
  } catch {
    return { time: '--:--:--', date: '---', offset: '' }
  }
}

export function useTimezone() {
  const storageKey = 'masaa_world_clocks'
  const saved = localStorage.getItem(storageKey)
  const zones = ref(saved ? JSON.parse(saved) : ['America/New_York', 'Europe/London', 'Asia/Tokyo'])
  const searchQuery = ref('')

  const worldClocks = computed(() =>
    zones.value.map(tz => {
      const city = CITIES.find(c => c.tz === tz)
      const { time, date, offset } = getTimeForZone(tz)
      return {
        name: city?.name || tz,
        abbr: city?.abbr || tz.split('/').pop(),
        tz,
        time,
        date,
        offset,
      }
    })
  )

  const filteredCities = computed(() => {
    const q = searchQuery.value.toLowerCase()
    if (!q) return CITIES.filter(c => !zones.value.includes(c.tz))
    return CITIES.filter(c =>
      !zones.value.includes(c.tz) &&
      (c.name.toLowerCase().includes(q) || c.tz.toLowerCase().includes(q))
    )
  })

  function addZone(tz) {
    if (!zones.value.includes(tz)) {
      zones.value.push(tz)
      persist()
    }
  }

  function removeZone(tz) {
    zones.value = zones.value.filter(z => z !== tz)
    persist()
  }

  function persist() {
    localStorage.setItem(storageKey, JSON.stringify(zones.value))
  }

  return {
    zones,
    worldClocks,
    searchQuery,
    filteredCities,
    addZone,
    removeZone,
    CITIES,
  }
}
