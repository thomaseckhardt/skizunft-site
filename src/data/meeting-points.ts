export type MeetingPoint = {
  id: string
  /** Short text shown inside the map marker, a dot is shown without it. */
  label?: string
  title: string
  description: string
  lat: number
  lng: number
}

export const kandelMeetingPoints: MeetingPoint[] = [
  {
    id: 'kandel-kandelhof',
    label: '1',
    title: 'Treffpunkt 1: Berggasthaus Kandelhof',
    description:
      'Junior Champion und Champion Skikurse sowie alle Snowboard Kurse.',
    lat: 48.0632278,
    lng: 8.0182469,
  },
  {
    id: 'kandel-parkplatz',
    label: '2',
    title: 'Treffpunkt 2: Parkplatz',
    description: 'Bambini und Beginner Skikurse.',
    lat: 48.0607439,
    lng: 8.0174853,
  },
]

export const muggenbrunnMeetingPoints: MeetingPoint[] = [
  {
    id: 'muggenbrunn-harryhirsch',
    title: 'Treffpunkt: Harryhirsch Kiosk Hütte an der Talstation',
    description: 'Alle Kurse in Muggenbrunn.',
    lat: 47.8685109,
    lng: 7.9177812,
  },
]

export const googleMapsRouteUrl = ({ lat, lng }: MeetingPoint) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
