import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { CampaignsApi, type Campaign } from '@/api/CampaignsApi'
import { GiftsApi, type GiftDetail } from '@/api/GiftsApi'
import { SectionsApi } from '@/api/SectionsApi'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAppStore } from '@/store/useAppStore'
import { UserRole } from '@/types/user'
import { DeadlineCard } from '@/views/dashboard/components/DeadlineCard'
import { GiftDonutCard } from '@/views/dashboard/components/GiftDonutCard'
import { ProgressCard } from '@/views/dashboard/components/ProgressCard'

const DASHBOARD_GOAL = 1000
const CHART_COLORS = ['#DD7E00', '#7C3AED', '#0B6E4F', '#2563EB', '#DC2626', '#0EA5E9']

async function fetchAllGifts(limitPerPage = 200): Promise<GiftDetail[]> {
  let page = 1
  let totalPages = 1
  const gifts: GiftDetail[] = []

  do {
    const response = await GiftsApi.list({ page, limit: limitPerPage })
    gifts.push(...response.items)
    totalPages = response.meta.totalPages
    page += 1
  } while (page <= totalPages)

  return gifts
}

function formatCampaignDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return 'Fecha invalida'
  }

  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function calculateDaysRemaining(value: string): number {
  const endDate = new Date(`${value}T23:59:59`)

  if (Number.isNaN(endDate.getTime())) {
    return -1
  }

  const now = new Date()
  const diff = endDate.getTime() - now.getTime()

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function groupItems(items: GiftDetail[], key: 'categoria' | 'materia') {
  const grouped = items.reduce<Record<string, number>>((acc, item) => {
    const groupKey = item[key] || 'Sin dato'
    acc[groupKey] = (acc[groupKey] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
}

export function DashboardPage() {
  usePageTitle('Dashboard')

  const { isMobile, isTablet } = useIsMobile()
  const user = useAppStore((state) => state.user)
  const isProfesor = user.rol === UserRole.PROFESOR
  const [selectedCampaignId, setSelectedCampaignId] = useState('')

  const campaignsQuery = useQuery({
    queryKey: ['dashboard-campaigns'],
    queryFn: () => CampaignsApi.list({ page: 1, limit: 200 }),
  })

  const sectionsQuery = useQuery({
    queryKey: ['dashboard-sections'],
    queryFn: () => SectionsApi.list({ page: 1, limit: 500 }),
  })

  const giftsQuery = useQuery({
    queryKey: ['dashboard-gifts'],
    queryFn: () => fetchAllGifts(),
  })

  useEffect(() => {
    if (!campaignsQuery.data?.items.length) return

    if (!selectedCampaignId) {
      const activeCampaign = campaignsQuery.data.items.find((campaign) => campaign.estado === 'activa')
      setSelectedCampaignId(String(activeCampaign?.id ?? campaignsQuery.data.items[0].id))
      return
    }

    const exists = campaignsQuery.data.items.some((campaign) => String(campaign.id) === selectedCampaignId)

    if (!exists) {
      setSelectedCampaignId(String(campaignsQuery.data.items[0].id))
    }
  }, [campaignsQuery.data, selectedCampaignId])

  const selectedCampaign = useMemo(() => {
    return campaignsQuery.data?.items.find((campaign) => String(campaign.id) === selectedCampaignId) ?? null
  }, [campaignsQuery.data, selectedCampaignId])

  const giftsByCampaign = useMemo(() => {
    if (!selectedCampaign || !sectionsQuery.data || !giftsQuery.data) {
      return [] as GiftDetail[]
    }

    const sectionIds = new Set(
      sectionsQuery.data.items
        .filter((section) => String(section.campanaId) === String(selectedCampaign.id))
        .map((section) => String(section.id)),
    )

    return giftsQuery.data.filter((gift) => sectionIds.has(String(gift.seccionId)))
  }, [giftsQuery.data, sectionsQuery.data, selectedCampaign])

  const categoryChartItems = useMemo(() => groupItems(giftsByCampaign, 'categoria'), [giftsByCampaign])
  const subjectChartItems = useMemo(() => groupItems(giftsByCampaign, 'materia'), [giftsByCampaign])

  if (campaignsQuery.isLoading || sectionsQuery.isLoading || giftsQuery.isLoading) {
    return <section className='mx-auto w-full max-w-[1080px] py-6 text-center text-ownText'>Cargando dashboard...</section>
  }

  if (
    campaignsQuery.isError ||
    sectionsQuery.isError ||
    giftsQuery.isError ||
    !campaignsQuery.data ||
    !sectionsQuery.data ||
    !giftsQuery.data
  ) {
    return (
      <section className='mx-auto w-full max-w-[1080px] py-6 text-center text-red-600'>
        No se pudieron cargar los datos del dashboard.
      </section>
    )
  }

  if (campaignsQuery.data.items.length === 0) {
    return (
      <section className='mx-auto w-full max-w-[1080px] py-6 text-center text-ownText'>
        No hay campanas registradas.
      </section>
    )
  }

  const singleColumn = isMobile || isTablet

  return (
    <section className='mx-auto w-full px-10 space-y-6 my-10'>
      <div className={singleColumn ? 'flex justify-center' : ''}>
        <label className='sr-only text-[24px]' htmlFor='dashboard-campaign-select'>
          Campaña
        </label>
        <select
          className='min-h-[42px] min-w-[220px] rounded-[6px] border border-black/65 bg-white px-3 text-[24px] text-ink'
          id='dashboard-campaign-select'
          onChange={(event) => setSelectedCampaignId(event.target.value)}
          value={selectedCampaignId}
        >
          {campaignsQuery.data.items.map((campaign: Campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className={singleColumn ? 'mx-auto grid max-w-[560px] grid-cols-1 gap-6' : 'grid grid-cols-2 gap-6'}>
        <DeadlineCard
          daysRemaining={selectedCampaign ? calculateDaysRemaining(selectedCampaign.fin) : -1}
          endDateLabel={selectedCampaign ? formatCampaignDate(selectedCampaign.fin) : 'Sin fecha'}
        />
        <ProgressCard goal={DASHBOARD_GOAL} totalGifts={giftsByCampaign.length} />
      </div>

      {singleColumn ? (
        <div className='mx-auto grid max-w-[560px] grid-cols-1 gap-6'>
          <GiftDonutCard items={categoryChartItems} title='Regalos por Categorias' />
          {!isProfesor ? <GiftDonutCard items={subjectChartItems} title='Regalos por Materias' /> : null}
        </div>
      ) : isProfesor ? (
        <div className='flex justify-center'>
          <div className='w-full max-w-[560px]'>
            <GiftDonutCard items={categoryChartItems} title='Regalos por Categorias' />
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-6'>
          <GiftDonutCard items={categoryChartItems} title='Regalos por Categorias' />
          <GiftDonutCard items={subjectChartItems} title='Regalos por Materias' />
        </div>
      )}
    </section>
  )
}
