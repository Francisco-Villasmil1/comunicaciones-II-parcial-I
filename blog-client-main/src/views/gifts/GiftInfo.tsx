import giftIcon from '@/assets/gift.svg'
import { SquarePen } from 'lucide-react'

export type GiftInfoDisplay = {
  id: string
  studentName: string
  giftName?: string
  teacher?: string
  subject?: string
  section?: string
  points?: string
}

type GiftInfoProps = {
  gift: GiftInfoDisplay
  onBack: () => void
  onEdit: () => void
  className?: string
}

export function GiftInfo({ gift, onBack, onEdit, className = '' }: GiftInfoProps) {
  const fields: { label: string; value: string }[] = [
    { label: 'Nombre', value: gift.studentName || '—' },
    { label: 'Regalo', value: gift.giftName?.trim() ? gift.giftName : 'Pendiente' },
    { label: 'Profesor', value: gift.teacher?.trim() ? gift.teacher : '—' },
    { label: 'Materia', value: gift.subject?.trim() ? gift.subject : '—' },
    { label: 'Seccion', value: gift.section?.trim() ? gift.section : '—' },
    { label: 'Puntos', value: gift.points?.trim() ? gift.points : '—' },
  ]

  return (
    <div
      className={`relative flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-[12px] border-2 border-[#8B0000] bg-[#FFE95C] shadow-[0px_8px_24px_rgba(0,0,0,0.25)] focus-within:outline-none  ${className}`}
    >
      <img
        alt=''
        aria-hidden
        className='pointer-events-none absolute inset-0 h-full w-full object-cover'
        src={giftIcon}
        style={{
          transform: 'scale(1.20)',
          filter:
            'brightness(0) saturate(100%) invert(9%) sepia(95%) saturate(6200%) hue-rotate(10deg) brightness(100%) contrast(90%)',
        }}
      />

      <div className='relative z-10 flex min-h-0 flex-1 flex-col px-10 pb-10 pt-10'>
        <div
          className='mx-auto flex min-h-0 w-full max-w-[252px] flex-1 flex-col overflow-hidden rounded-lg border-4 border-[#5E4637] bg-[#FFF8DC] p-10 shadow-inner sm:max-w-[288px] md:max-w-[408px] lg:max-w-[456px]'
        >
          <div className='flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain md:gap-3'>
            {fields.map((field) => (
              <div key={field.label} className='flex w-full min-w-0 flex-col gap-1'>
                <p className='text-center text-sm font-bold text-black md:text-base'>{field.label}</p>
                <div className='min-h-[40px] w-full break-words rounded-md border border-black bg-white px-2 py-2 text-center text-sm font-semibold leading-snug text-slate-900 md:min-h-[44px] md:px-8 md:py-2.5 md:text-base'>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-10 flex w-full shrink-0 flex-row items-center justify-center md:gap-20 sm:gap-10'>
          <button
            className='min-h-[44px] min-w-[132px] rounded-[10px] bg-[#1D4ED8] px-8 py-2.5 text-base font-semibold text-white shadow-[0px_2px_4px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#234ac0]'
            onClick={onBack}
            type='button'
          >
            Volver
          </button>
          <button
            aria-label='Editar regalo'
            className='inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#1D4ED8] text-white shadow-[0px_2px_4px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#234ac0]'
            onClick={onEdit}
            type='button'
          >
            <SquarePen aria-hidden className='h-9 w-9 object-contain' />
          </button>
        </div>
      </div>
    </div>
  )
}
