export type DashboardMetric = {
  label: string
  value: string
  helper: string
}

export type DonationTrend = {
  periodo: string
  donaciones: number
}

export type RecentDonation = {
  id: number
  estudiante: string
  seccion: string
  categoria: string
  puntos: number
}
