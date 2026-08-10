import { useEffect, useMemo, useState } from 'react'
import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'

import { CampaignsApi } from '@/api/CampaignsApi'
import { GiftsApi, type GiftDetail } from '@/api/GiftsApi'
import { SectionsApi } from '@/api/SectionsApi'
import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { useIsMobile } from '@/hooks/useIsMobile'

const pdfExportFormSchema = z.object({
  docente: z.string().min(1, 'El docente es requerido.'),
  campana: z.string().min(1, 'La campaña es requerida.'),
  materiaSeccion: z.string().min(1, 'La seccion es requerida.'),
})

export type PdfExportFormValues = z.infer<typeof pdfExportFormSchema>

export type PdfExportModalOptions = {
  docentes: { label: string; value: string }[]
  campanas: { label: string; value: string }[]
  materiaSeccion: { label: string; value: string }[]
  secciones: Array<{
    id: string
    materia: string
    numero: string
    docenteId: string
    docente: string
    campanaId: string
  }>
}



async function fetchPdfExportModalOptions(): Promise<PdfExportModalOptions> {
  const [opts, sectionsList, campaignsRes] = await Promise.all([
    SectionsApi.getOptions(),
    SectionsApi.list({ page: 1, limit: 200 }),
    CampaignsApi.list({ page: 1, limit: 200 }),
  ])

  const materiaSeccion = sectionsList.items.map((s) => ({
    label: `${s.materia} — Seccion ${s.numero}`,
    value: String(s.id),
  }))

  const campanas = campaignsRes.items.map((c) => ({
    label: `${c.nombre} (${c.estado})`,
    value: String(c.id),
  }))

  return {
    docentes: opts.docentes,
    campanas,
    materiaSeccion,
    secciones: sectionsList.items.map((s) => ({
      id: String(s.id),
      materia: s.materia,
      numero: s.numero,
      docenteId: String(s.docenteId),
      docente: s.docente,
      campanaId: String(s.campanaId),
    })),
  }
}

const reportStyles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  headingBlock: {
    marginBottom: 14,
    gap: 4,
  },
  headingText: {
    fontSize: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  headerRow: {
    backgroundColor: '#e5e7eb',
  },
  cell: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  cellLast: {
    borderRightWidth: 0,
  },
  studentCol: { width: '32%' },
  cedulaCol: { width: '20%' },
  descCol: { width: '33%' },
  pointsCol: { width: '15%' },
  headerText: {
    fontSize: 10,
    fontWeight: 700,
  },
  bodyText: {
    fontSize: 10,
  },
  emptyRowText: {
    padding: 8,
    fontSize: 10,
    textAlign: 'center',
  },
})

function GiftReportDocument({
  docente,
  materiaSeccion,
  gifts,
}: {
  docente: string
  materiaSeccion: string
  gifts: GiftDetail[]
}) {
  return (
    <Document>
      <Page size='A4' style={reportStyles.page}>
        <View style={reportStyles.headingBlock}>
          <Text style={reportStyles.headingText}>Docente: {docente}</Text>
          <Text style={reportStyles.headingText}>Materia y Seccion: {materiaSeccion}</Text>
        </View>

        <View style={reportStyles.table}>
          <View style={[reportStyles.row, reportStyles.headerRow]}>
            <View style={[reportStyles.cell, reportStyles.studentCol]}>
              <Text style={reportStyles.headerText}>Nombre del estudiante</Text>
            </View>
            <View style={[reportStyles.cell, reportStyles.cedulaCol]}>
              <Text style={reportStyles.headerText}>Cedula</Text>
            </View>
            <View style={[reportStyles.cell, reportStyles.descCol]}>
              <Text style={reportStyles.headerText}>Descripcion</Text>
            </View>
            <View style={[reportStyles.cell, reportStyles.pointsCol, reportStyles.cellLast]}>
              <Text style={reportStyles.headerText}>Puntos</Text>
            </View>
          </View>

          {gifts.length === 0 ? (
            <Text style={reportStyles.emptyRowText}>No hay regalos registrados para los filtros seleccionados.</Text>
          ) : (
            gifts.map((gift) => (
              <View key={gift.id} style={reportStyles.row}>
                <View style={[reportStyles.cell, reportStyles.studentCol]}>
                  <Text style={reportStyles.bodyText}>{gift.nombre}</Text>
                </View>
                <View style={[reportStyles.cell, reportStyles.cedulaCol]}>
                  <Text style={reportStyles.bodyText}>{gift.cedula}</Text>
                </View>
                <View style={[reportStyles.cell, reportStyles.descCol]}>
                  <Text style={reportStyles.bodyText}>{gift.descripcion || 'Sin descripcion'}</Text>
                </View>
                <View style={[reportStyles.cell, reportStyles.pointsCol, reportStyles.cellLast]}>
                  <Text style={reportStyles.bodyText}>{gift.puntos}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  )
}

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

type PdfExportModalProps = {
  isOpen: boolean
  onClose: () => void
}

const FORM_ID = 'pdf-export-form'
const PDF_EXPORT_TITLE_ID = 'pdf-export-dialog-title'
const PDF_EXPORT_DESC_ID = 'pdf-export-dialog-description'

export function PdfExportModal({ isOpen, onClose }: PdfExportModalProps) {
  const { isMobile, isTablet } = useIsMobile()
  const isCompact = isMobile || isTablet
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [selectedDocente, setSelectedDocente] = useState('')
  const [selectedCampana, setSelectedCampana] = useState('')

  const optionsQuery = useQuery({
    queryKey: ['pdf-export-modal-options'],
    queryFn: fetchPdfExportModalOptions,
    enabled: isOpen,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || optionsQuery.isLoading || !optionsQuery.data) return

    const frame = window.requestAnimationFrame(() => {
      const form = document.getElementById(FORM_ID)
      const focusTarget = form?.querySelector<HTMLElement>('.MuiInputBase-root:not(.Mui-disabled)')
      focusTarget?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, optionsQuery.isLoading, optionsQuery.data])

  const formWidth = isMobile ? '100%' : isTablet ? 480 : 520
  const labelFontSize = isCompact ? '16px' : '18px'
  const placeholderFontSize = isCompact ? '14px' : undefined

  const filteredMateriaSeccionOptions = useMemo(() => {
    if (!optionsQuery.data) {
      return [] as Array<{ label: string; value: string }>
    }

    return optionsQuery.data.materiaSeccion.filter((option) => {
      const section = optionsQuery.data?.secciones.find((item) => item.id === option.value)

      if (!section) {
        return false
      }

      const docenteMatches = !selectedDocente || section.docenteId === selectedDocente
      const campanaMatches = !selectedCampana || section.campanaId === selectedCampana

      return docenteMatches && campanaMatches
    })
  }, [optionsQuery.data, selectedCampana, selectedDocente])

  const handleSubmit = async (values: PdfExportFormValues) => {
    if (!optionsQuery.data) {
      toast.error('No se pudieron cargar los datos para generar el reporte.')
      return
    }

    const selectedSection = optionsQuery.data.secciones.find((section) => section.id === values.materiaSeccion)

    if (!selectedSection) {
      toast.error('La materia-seccion seleccionada no es valida.')
      return
    }

    if (selectedSection.docenteId !== values.docente || selectedSection.campanaId !== values.campana) {
      toast.error('La materia-seccion no corresponde al docente y campaña seleccionados.')
      return
    }

    try {
      setIsGenerating(true)

      const allGifts = await fetchAllGifts()
      const gifts = allGifts.filter((gift) => String(gift.seccionId) === values.materiaSeccion)

      const blob = await pdf(
        <GiftReportDocument
          docente={selectedSection.docente}
          materiaSeccion={`${selectedSection.materia} — Seccion ${selectedSection.numero}`}
          gifts={gifts}
        />,
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-regalos-seccion-${selectedSection.numero}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Reporte PDF generado y descargado correctamente.')
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo generar el reporte PDF.'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  const fields: BaseFormField<PdfExportFormValues>[] =
    optionsQuery.data != null
      ? [
        {
          name: 'docente',
          label: 'Docente',
          placeholder: '↓ Seleccionar',
          select: true,
          options: optionsQuery.data.docentes,
          onValueChange: (value, methods) => {
            setSelectedDocente(value)

            const selectedSection = methods.getValues('materiaSeccion')

            if (!selectedSection) return

            const stillValid = optionsQuery.data.secciones.some(
              (section) =>
                section.id === selectedSection &&
                section.docenteId === value &&
                (!selectedCampana || section.campanaId === selectedCampana),
            )

            if (!stillValid) {
              methods.setValue('materiaSeccion', '', {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          },
          rules: { required: 'El docente es requerido.' },
          className: 'col-span-1 w-full min-w-0',
        },
        {
          name: 'campana',
          label: 'Campaña',
          placeholder: '↓ Seleccionar',
          select: true,
          options: optionsQuery.data.campanas,
          onValueChange: (value, methods) => {
            setSelectedCampana(value)

            const selectedSection = methods.getValues('materiaSeccion')

            if (!selectedSection) return

            const stillValid = optionsQuery.data.secciones.some(
              (section) =>
                section.id === selectedSection &&
                section.campanaId === value &&
                (!selectedDocente || section.docenteId === selectedDocente),
            )

            if (!stillValid) {
              methods.setValue('materiaSeccion', '', {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          },
          rules: { required: 'La campaña es requerida.' },
          className: 'col-span-1 w-full min-w-0',
        },
        {
          name: 'materiaSeccion',
          label: 'Seccion',
          placeholder: '↓ Seleccionar',
          select: true,
          options: filteredMateriaSeccionOptions,
          rules: { required: 'La seccion es requerida.' },
          className: 'col-span-1 w-full min-w-0',
        },
      ]
      : []

  return createPortal(
    <div
      aria-label='Ventana de exportacion de regalos'
      aria-describedby={PDF_EXPORT_DESC_ID}
      aria-labelledby={PDF_EXPORT_TITLE_ID}
      aria-modal='true'
      className='fixed inset-0 z-[100] flex items-center justify-center p-4'
      role='dialog'
    >
      <div
        aria-hidden='true'
        className='absolute inset-0 bg-slate-900/45'
        onClick={onClose}
        role='presentation'
      />

      <div
        className='animate-gift-view-in relative z-10 w-full max-w-[540px] rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0px_12px_48px_rgba(0,0,0,0.18)] sm:p-8'
        onClick={(e) => e.stopPropagation()}
      >
    
        {optionsQuery.isLoading ? (
          <p className='min-h-[200px] py-16 text-center text-slate-600' role='status'>
            Cargando opciones...
          </p>
        ) : optionsQuery.isError || !optionsQuery.data ? (
          <div className='space-y-4 py-4 text-center' aria-label='Error al cargar las opciones del formulario'>
            <p className='text-slate-700' role='alert'>
              No se pudieron cargar las opciones del formulario.
            </p>
            <button
              aria-label='Cerrar ventana de exportar PDF'
              className='rounded-[10px] bg-[#1D4ED8] px-6 py-2 text-sm font-semibold text-white hover:bg-[#234ac0]'
              onClick={onClose}
              type='button'
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className='flex w-full flex-col items-stretch' aria-label='Formulario de exportacion de regalos'>
            <div className='flex w-full justify-center'>
              <BaseForm<PdfExportFormValues>
                className='mx-auto grid w-full max-w-full grid-cols-1 gap-y-4'
                defaultValues={{
                  docente: '',
                  campana: '',
                  materiaSeccion: '',
                }}
                fields={fields}
                id={FORM_ID}
                labelFontSize={labelFontSize}
                labelFontWeight={600}
                mode='onChange'
                onSubmit={handleSubmit}
                onValidityChange={setIsFormValid}
                placeholderFontSize={placeholderFontSize}
                width={formWidth}
              />
            </div>

            <div className='mt-8 flex w-full justify-center'>
              <button
                aria-label='Generar Reporte PDF'
                aria-busy={isGenerating}
                className='min-h-[44px] min-w-[220px] rounded-[12px] bg-[#1D4ED8] px-8 py-2.5 text-base font-semibold text-white shadow-[0px_2px_4px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#234ac0] disabled:cursor-not-allowed disabled:opacity-60'
                disabled={!isFormValid || isGenerating}
                form={FORM_ID}
                type='submit'
              >
                {isGenerating ? 'Generando...' : 'Generar Reporte PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
