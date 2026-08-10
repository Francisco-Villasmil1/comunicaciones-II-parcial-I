import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { GiftsApi, type GiftPayload } from '@/api/GiftsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAppStore } from '@/store/useAppStore'
import { UserRole } from '@/types/user'
import { GiftsForm, type GiftsFormValues } from '@/views/gifts/GiftForm'

function toPayload(values: GiftsFormValues): GiftPayload {
  const descripcion = values.descripcion?.trim()

  return {
    nombre: values.nombre,
    cedula: values.cedula,
    materia: values.materia,
    seccion: values.seccion,
    categoria: values.categoria,
    descripcion: descripcion ? descripcion : undefined,
    puntos: values.puntos,
  }
}

export function NewGift() {
  usePageTitle('Nuevo Regalo')

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAppStore((state) => state.user)

  const optionsQuery = useQuery({
    queryKey: ['gift-options'],
    queryFn: () => GiftsApi.getOptions(),
  })

  const createMutation = useMutation({
    mutationFn: async (values: GiftsFormValues) => {
      return GiftsApi.create(toPayload(values))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['donaciones'] })
      toast.success('¡El regalo se ha guardado con éxito!.')
      navigate('/regalos')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo crear el regalo.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: GiftsFormValues) => {
    const mappedSubject = sectionSubjectMap[values.seccion]
    const normalizedValues = mappedSubject
      ? {
        ...values,
        materia: mappedSubject,
      }
      : values

    await createMutation.mutateAsync(normalizedValues)
  }

  const isProfesor = user.rol === UserRole.PROFESOR && user.id != null

  const resolvedOptions = useMemo(() => {
    if (!optionsQuery.data) return null

    if (!isProfesor) {
      return optionsQuery.data
    }

    const secciones = optionsQuery.data.secciones.filter((section) => section.docenteId === user.id)
    const allowedSubjectIds = new Set(secciones.map((section) => String(section.materiaId)))
    const materias = optionsQuery.data.materias.filter((subject) => allowedSubjectIds.has(subject.value))

    return {
      ...optionsQuery.data,
      materias,
      secciones,
    }
  }, [isProfesor, optionsQuery.data, user.id])

  const sectionSubjectMap = useMemo(() => {
    if (!resolvedOptions) {
      return {} as Record<string, string>
    }

    return Object.fromEntries(
      resolvedOptions.secciones.map((section) => [section.value, String(section.materiaId)]),
    )
  }, [resolvedOptions])

  const preselectedSection =
    isProfesor && resolvedOptions?.secciones.length === 1 ? resolvedOptions.secciones[0].value : ''
  const preselectedSubject = preselectedSection ? sectionSubjectMap[preselectedSection] ?? '' : ''
  const shouldLockSectionAndSubject = isProfesor && resolvedOptions?.secciones.length === 1

  if (optionsQuery.isLoading) {
    return (
      <main aria-label='Vista de creacion de regalo' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando opciones del formulario...</p>
      </main>
    )
  }

  if (optionsQuery.isError || !resolvedOptions) {
    return (
      <main
        aria-label='Vista de creacion de regalo'
        className='mx-auto w-full max-w-[980px] space-y-4 py-6'
      >
        <p>No se pudieron cargar las opciones del formulario.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/regalos')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <main aria-label='Vista de creacion de regalo' className='mx-auto w-full max-w-[980px] py-6'>
      {isProfesor && resolvedOptions.secciones.length === 0 ? (
        <p className='mb-4 text-sm text-slate-700'>No tienes secciones asignadas para registrar donaciones.</p>
      ) : null}

      <GiftsForm
        loading={createMutation.isPending}
        initialValues={
          preselectedSection
            ? {
              seccion: preselectedSection,
              materia: preselectedSubject,
            }
            : undefined
        }
        options={resolvedOptions}
        origin='creation'
        lockSectionAndSubject={shouldLockSectionAndSubject}
        sectionSubjectMap={sectionSubjectMap}
        onCancel={() => navigate('/regalos')}
        onSubmit={onSubmit}
      />
    </main>
  )
}
