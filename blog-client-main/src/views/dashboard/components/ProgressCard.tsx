import { DashboardCard } from '@/views/dashboard/components/DashboardCard'

type ProgressCardProps = {
  totalGifts: number
  goal: number
}

export function ProgressCard({ totalGifts, goal }: ProgressCardProps) {
  const safeGoal = goal <= 0 ? 1 : goal
  const progressRatio = Math.min(1, Math.max(0, totalGifts / safeGoal))
  const progressPercent = Math.round(progressRatio * 100)

  return (
    <DashboardCard title='Progreso de la campaña seleccionada'>
      <div className='space-y-4'>
        <div
          aria-label={`Progreso ${progressPercent} por ciento`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progressPercent}
          className='h-10 w-full overflow-hidden rounded-full border border-black/45 bg-white'
          role='progressbar'
        >
          <div
            className='h-full rounded-full bg-[#DD7E00] transition-all'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className='text-[28px] leading-tight text-ink'>
          ¡Se han recolectado {totalGifts} regalos!
        </p>
      </div>
    </DashboardCard>
  )
}
