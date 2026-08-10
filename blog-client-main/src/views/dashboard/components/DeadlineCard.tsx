import { DashboardCard } from '@/views/dashboard/components/DashboardCard'

type DeadlineCardProps = {
  endDateLabel: string
  daysRemaining: number
}

export function DeadlineCard({ endDateLabel, daysRemaining }: DeadlineCardProps) {
  return (
    <DashboardCard title='La campaña termina el...!'>
      <div className='space-y-3 text-center'>
        <p className='inline-block rounded-[10px] bg-[#CCD9FF] px-3 py-1 text-[40px] leading-none text-black'>
          {endDateLabel}
        </p>

        <p className='text-[28px] leading-tight text-ink'>
          {daysRemaining >= 0 ? `¡${daysRemaining} dias restantes!` : '¡Campaña finalizada!'}
        </p>
      </div>
    </DashboardCard>
  )
}
