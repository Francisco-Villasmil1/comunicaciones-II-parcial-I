import { useCallback, useEffect, useMemo, useRef, useState, type AnimationEvent, type KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { GiftsApi } from '@/api/GiftsApi'
import giftIcon from '@/assets/gift.svg'
import pdfIcon from '@/assets/pdf.svg'
import ticketIcon from '@/assets/ticket.svg'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePageTitle } from '@/hooks/usePageTitle'
import { GiftInfo, type GiftInfoDisplay } from '@/views/gifts/GiftInfo'
import { PdfExportModal } from '@/views/gifts/PdfExport'

type GiftItem = GiftInfoDisplay

function formatStudentLabel(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'Estudiante'

  const firstName = parts[0]
  const apellidoInitial = parts.length > 1 ? parts[1].charAt(0).toUpperCase() : ''

  return apellidoInitial ? `${firstName} ${apellidoInitial}.` : firstName
}

export function GiftsPage() {
  usePageTitle('Regalos')
  const navigate = useNavigate()
  const { isMobile, isTablet } = useIsMobile()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)
  const [detailExiting, setDetailExiting] = useState(false)
  const [pdfExportOpen, setPdfExportOpen] = useState(false)
  const detailViewRef = useRef<HTMLDivElement | null>(null)

  const giftsPerPage = isMobile || isTablet ? 9 : 12
  const giftsQuery = useQuery({
    queryKey: ['donaciones', currentPage, giftsPerPage],
    queryFn: () => GiftsApi.list({ page: currentPage, limit: giftsPerPage }),
  })

  const totalPages = Math.max(1, giftsQuery.data?.meta.totalPages ?? 1)

  const currentPageGifts = useMemo(() => {
    if (!giftsQuery.data) {
      return [] as GiftItem[]
    }

    return giftsQuery.data.items.map((gift) => ({
      id: String(gift.id),
      studentName: gift.nombre,
      giftName: gift.descripcion,
      teacher: gift.docente,
      subject: gift.materia,
      section: gift.seccion,
      points: String(gift.puntos),
    }))
  }, [giftsQuery.data])

  const hasNoGifts = !giftsQuery.isLoading && !giftsQuery.isError && currentPageGifts.length === 0

  useEffect(() => {
    setDetailExiting(false)
  }, [selectedGift])

  useEffect(() => {
    if (!selectedGift || detailExiting) return
    detailViewRef.current?.focus()
  }, [detailExiting, selectedGift])

  const beginCloseDetail = useCallback(() => {
    setDetailExiting(true)
  }, [])

  const handleDetailAnimationEnd = useCallback((e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (!e.animationName.includes('gift-view-out')) return
    if (!detailExiting) return
    setSelectedGift(null)
    setDetailExiting(false)
  }, [detailExiting])
  

  const handleEdit = useCallback(() => {
    if (!selectedGift) return
    navigate(`/regalos/edit/${selectedGift.id}`)
  }, [navigate, selectedGift])
  
  const handleDetailKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (detailExiting) return

    if (event.key === 'Escape') {
      event.preventDefault()
      beginCloseDetail()
      return
    }

  }, [beginCloseDetail, detailExiting])

  return (
    <section className='mx-auto min-h-screen w-full max-w-[980px] p-4'>
      <div className='flex flex-col'>
        {!selectedGift ? (
          <div className='mb-10 flex items-center justify-center gap-10'>
            <button
              aria-label='Añadir un nuevo regalo'
              className='h-9 min-w-[215px] rounded-[10px] bg-[#1D4ED8] px-4 text-base font-semibold text-white shadow-[0px_2px_4px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#234ac0] md:h-10 md:min-w-[286px] md:px-6 md:text-lg'
              onClick={() => navigate('/regalos/new')}
              type='button'
            >
              Añadir regalo
            </button>

            <button
              aria-label='Exportar regalos a PDF'
              className='inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#BC0000] bg-white p-1.5 shadow-[0px_2px_4px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#BC0000]'
              onClick={() => setPdfExportOpen(true)}
              type='button'
            >
              <img
                alt='Icono de PDF'
                className='h-9 w-9 object-contain'
                src={pdfIcon}
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(9%) sepia(95%) saturate(6200%) hue-rotate(10deg) brightness(100%) contrast(90%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(0) saturate(100%) invert(100%)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter =
                    'brightness(0) saturate(100%) invert(9%) sepia(95%) saturate(6200%) hue-rotate(10deg) brightness(100%) contrast(90%)'
                }}
              />
            </button>
          </div>
        ) : null}

        <div className='relative mb-10 min-h-[700px] w-full'>
          {selectedGift ? (
            <div
              key={selectedGift.id}
              aria-label={`Detalle del regalo de ${selectedGift.studentName}`}
              aria-keyshortcuts='Escape'
              className={`mx-auto w-full max-w-[670px] ${detailExiting ? 'animate-gift-view-out' : 'animate-gift-view-in'
                }`}
              onAnimationEnd={handleDetailAnimationEnd}
              onKeyDown={handleDetailKeyDown}
              ref={detailViewRef}
              role='region'
              tabIndex={0}
            >
              <GiftInfo
                className='min-h-[500px] md:min-h-[670px]'
                gift={selectedGift}
                onBack={beginCloseDetail}
                onEdit={handleEdit}
              />
            </div>
          ) : (
            <div className='animate-gift-view-in'>
              {giftsQuery.isLoading ? (
                <p className='mb-6 text-center text-slate-600'>Cargando regalos...</p>
              ) : null}

              {giftsQuery.isError ? (
                <p className='mb-6 text-center text-red-600'>No se pudieron cargar los regalos.</p>
              ) : null}

              {hasNoGifts ? (
                <p className='mb-6 text-center text-slate-700'>Aun no hay regalos registrados</p>
              ) : null}

              <div className='mb-10 rounded-[12px] border-2 border-slate-400 bg-white p-1 shadow-[0px_4px_6px_2px_rgba(0,0,0,0.20)]'>
                <div className='grid grid-cols-3 gap-1 md:grid-cols-4'>
                  {currentPageGifts.map((gift) => (
                    <button
                      aria-label={`Ver informacion del regalo de ${gift.studentName}`}
                      key={gift.id}
                      className='relative aspect-square w-full overflow-hidden rounded-[3px] border-white bg-[#FFE95C] p-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE95C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#8B0000]'
                      onClick={() => setSelectedGift(gift)}
                      type='button'
                    >
                      <img
                        alt=''
                        aria-hidden
                        className='absolute inset-0 h-full w-full object-cover'
                        src={giftIcon}
                        style={{
                          transform: 'scale(1.20)',
                          filter:
                            'brightness(0) saturate(100%) invert(9%) sepia(95%) saturate(6200%) hue-rotate(10deg) brightness(100%) contrast(90%)',
                        }}
                      />

                      <div className='absolute left-2/3 top-2/3 h-[50%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-[30px] bg-[#673131]'>
                        <img
                          alt=''
                          aria-hidden
                          className='h-full w-full object-contain'
                          src={ticketIcon}
                          style={{
                            transform: 'rotate(-90deg) scale(1.9) ',
                            filter:
                              'brightness(0) saturate(100%) invert(98%) sepia(13%) saturate(1212%) hue-rotate(328deg) brightness(104%) contrast(102%)',
                          }}
                        />
                        <div className='absolute left-3/4 top-1/2 h-[50%] w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[#EBCAA8] px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E4637] md:text-xs'>
                          <span className='absolute left-1'>{formatStudentLabel(gift.studentName)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!hasNoGifts ? (
                <div className='mt-10 flex items-center justify-center gap-2'>
                  <button
                    aria-label='Página anterior'
                    className={`px-3 py-1 text-3xl leading-none text-ownText transition-all ${currentPage > 1 ? 'visible opacity-100' : 'invisible opacity-0'
                      }`}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    type='button'
                    tabIndex={currentPage > 1 ? 0 : -1}
                  >
                    ←
                  </button>

                  <div className='flex items-center gap-2'>
                    {(() => {
                      const pages: number[] = []
                      const maxVisibleButtons = 5

                      let startPage = Math.max(1, currentPage - 2)
                      let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1)

                      if (endPage - startPage < maxVisibleButtons - 1) {
                        startPage = Math.max(1, endPage - maxVisibleButtons + 1)
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i)
                      }

                      return (
                        <>
                          {pages.map((pageNumber) => {
                            const isActive = pageNumber === currentPage
                            return (
                              <button
                                key={pageNumber}
                                aria-label={`Ir a la página ${pageNumber}`}
                                aria-current={isActive ? 'page' : undefined}
                                className={[
                                  'h-8 min-w-[40px] rounded-[4px] border border-[#1D4ED8] px-3 text-sm font-semibold transition-colors',
                                  isActive
                                    ? 'bg-[#1D4ED8] text-white'
                                    : 'bg-[#2955D9] text-white hover:bg-[#234ac0]',
                                ].join(' ')}
                                onClick={() => setCurrentPage(pageNumber)}
                                type='button'
                              >
                                {pageNumber}
                              </button>
                            )
                          })}

                          {endPage < totalPages && (
                            <span aria-hidden='true' className='px-1 font-bold text-[#1D4ED8]'>
                              ...
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  <button
                    aria-label='Página siguiente'
                    className={`px-3 py-1 text-3xl leading-none text-ownText transition-all ${currentPage < totalPages ? 'visible opacity-100' : 'invisible opacity-0'
                      }`}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    type='button'
                    tabIndex={currentPage < totalPages ? 0 : -1}
                  >
                    →
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <PdfExportModal isOpen={pdfExportOpen} onClose={() => setPdfExportOpen(false)} />
    </section>
  )
}
