import { BaseButton } from '@/components/BaseButton'

type FormActionsProps = {
  formId: string
  onCancel?: () => void
  cancelText?: string
  saveText?: string
  loading?: boolean
  saveDisabled?: boolean
}

export function FormActions({
  formId,
  onCancel,
  cancelText = 'Cancelar',
  saveText = 'Guardar',
  loading = false,
  saveDisabled = false,
}: FormActionsProps) {
  return (
    <div className='mx-auto flex w-full max-w-[600px] items-center justify-center gap-10 px-2'>
      <BaseButton
        ariaLabel={cancelText}
        borderRadius={'24px'}
        fullWidth={false}
        onClick={onCancel}
        text={cancelText}
        tone='secondary'
        type='button'
        className='w-[150px]'
      />

      <BaseButton
        ariaLabel={saveText}
        borderRadius={'24px'}
        disabled={saveDisabled}
        form={formId}
        fullWidth={false}
        loading={loading}
        text={saveText}
        tone='primary'
        type='submit'
        className='w-[150px]'
      />
    </div>
  )
}
