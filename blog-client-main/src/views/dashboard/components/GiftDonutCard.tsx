import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { DashboardCard } from '@/views/dashboard/components/DashboardCard'

type ChartItem = {
  name: string
  value: number
  color: string
}

type GiftDonutCardProps = {
  title: string
  items: ChartItem[]
}

export function GiftDonutCard({ title, items }: GiftDonutCardProps) {
  const hasData = items.some((item) => item.value > 0)
  const innerTitle = title.replace('Regalos por ', 'Regalos por\n')

  return (
    <DashboardCard className='min-h-[460px]' hideTitle title={title}>
      {hasData ? (
        <>
          <div className='relative mx-auto h-[280px] w-full max-w-[420px]'>
            <ResponsiveContainer height='100%' width='100%'>
              <PieChart>
                <Pie
                  cx='50%'
                  cy='50%'
                  data={items}
                  dataKey='value'
                  innerRadius={90}
                  nameKey='name'
                  outerRadius={120}
                  paddingAngle={1}
                >
                  {items.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
              <p className='whitespace-pre-line text-center text-[24px] font-semibold leading-tight text-[#393737]'>
                {innerTitle}
              </p>
            </div>
          </div>

          <ul className='mx-auto mt-2 w-fit space-y-2'>
            {items.map((item) => (
              <li className='flex items-center gap-2 text-[28px] text-ownText' key={item.name}>
                <span
                  aria-hidden
                  className='inline-block h-3.5 w-3.5 rounded-[2px]'
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className='flex h-[320px] items-center justify-center text-center text-[32px] text-ownText'>
          No hay datos para mostrar.
        </div>
      )}
    </DashboardCard>
  )
}
