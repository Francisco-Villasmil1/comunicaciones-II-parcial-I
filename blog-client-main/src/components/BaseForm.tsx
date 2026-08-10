import { MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, type ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import type {
  ControllerRenderProps,
  DefaultValues,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'


type SelectOption = {
  label: string
  value: string
}

export type BaseFormField<TFormValues extends FieldValues> = {
  name: Path<TFormValues>
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'date' | 'number'
  multiline?: boolean
  rows?: number
  select?: boolean
  options?: SelectOption[]
  disabled?: boolean
  onValueChange?: (value: string, methods: UseFormReturn<TFormValues>) => void
  className?: string
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>
}

type BaseFormProps<TFormValues extends FieldValues> = {
  id?: string
  fields: BaseFormField<TFormValues>[]
  defaultValues: DefaultValues<TFormValues>
  onSubmit: (values: TFormValues, methods: UseFormReturn<TFormValues>) => void | Promise<void>
  width?: number | string
  labelFontSize?: number | string
  labelFontWeight?: number
  placeholderFontSize?: number | string
  className?: string
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'
  onValidityChange?: (isValid: boolean) => void
  children?: (context: {
    methods: UseFormReturn<TFormValues>
  }) => ReactNode
}

export function BaseForm<TFormValues extends FieldValues>({
  id,
  fields,
  defaultValues,
  onSubmit,
  width = '100%',
  labelFontSize,
  labelFontWeight = 500,
  placeholderFontSize,
  className,
  mode = 'onSubmit',
  onValidityChange,
  children,
}: BaseFormProps<TFormValues>) {
  const { isMobile, isTablet } = useIsMobile()
  const isCompact = isMobile || isTablet
  const effectiveLabelFontSize = labelFontSize ?? (isCompact ? '16px' : '20px')
  const effectivePlaceholderFontSize = placeholderFontSize ?? (isCompact ? '14px' : undefined)


  const methods = useForm<TFormValues>({
    defaultValues,
    mode,
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = methods

  useEffect(() => {
    onValidityChange?.(isValid)
  }, [isValid, onValidityChange])

  const getSharedFieldSx = (isSelect?: boolean) => ({
    '& .MuiInputBase-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      minHeight: 40,
    },
    '& .MuiInputBase-input': {
      color: '#676464',
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#676464',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4b5563',
    },
    '& .MuiInputBase-input::placeholder': {
      color: '#9ca3af',
      opacity: 1,
      ...(effectivePlaceholderFontSize ? { fontSize: effectivePlaceholderFontSize } : {}),
    },
    ...(isSelect
      ? {
        '& .MuiSelect-select.MuiInputBase-input.MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflow: 'visible',
          textOverflow: 'clip',
          lineHeight: 1.35,
          minHeight: 'unset',
          boxSizing: 'border-box',
          paddingTop: '8.5px',
          paddingBottom: '8.5px',
        },
      }
      : {}),
  })

  const renderSelectField = (
    field: BaseFormField<TFormValues>,
    helperText: string,
    controlledField: ControllerRenderProps<TFormValues, Path<TFormValues>>,
    fieldId: string,
  ) => (
    <TextField
      id={fieldId}
      error={Boolean(errors[field.name])}
      fullWidth
      helperText={helperText}
      FormHelperTextProps={{ id: `${fieldId}-helper` }}
      inputProps={{ 'aria-describedby': `${fieldId}-helper` }}
      select
      disabled={field.disabled}
      size='small'
      sx={getSharedFieldSx(true)}
      value={(controlledField.value as string | undefined) ?? ''}
      onBlur={controlledField.onBlur}
      onChange={(event) => {
        controlledField.onChange(event)
        field.onValueChange?.(String(event.target.value ?? ''), methods)
      }}
      onKeyDown={(event) => {
        if (
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp' ||
          event.key === 'ArrowRight' ||
          event.key === 'ArrowLeft'
        ) {

          event.preventDefault()
        }
      }}
      inputRef={controlledField.ref}
      SelectProps={{
        displayEmpty: true,
        renderValue: (selected) => {
          const selectedValue = String(selected ?? '')
          const hasSelectedValue = Boolean(selectedValue)

          const selectedOption = hasSelectedValue
            ? field.options?.find((option) => option.value === selectedValue)
            : null

          return (
            <span
              style={{
                color: hasSelectedValue ? '#676464' : '#9ca3af',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                display: 'block',
              }}
            >
              {hasSelectedValue ? selectedOption?.label ?? selectedValue : field.placeholder ?? ''}
            </span>
          )
        },
      }}
    >
      {field.placeholder ? (
        <MenuItem disabled value='' sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {field.placeholder}
        </MenuItem>
      ) : null}
      {field.options?.map((option) => (
        <MenuItem
          key={option.value}
          sx={{ whiteSpace: 'normal', wordBreak: 'break-word', alignItems: 'flex-start', py: 1 }}
          value={option.value}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )

  const submit = handleSubmit(async (values) => {
    await onSubmit(values, methods)
  })

  return (
    <form
      className={className}
      id={id}
      onSubmit={submit}
      style={{
        boxShadow: '0px 4px 6px 4px rgba(0,0,0,0.16)',
        borderRadius: isCompact ? 14 : 12,
        padding: 30,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        width,
      }}
    >
      {fields.map((field) => {
        const fieldError = errors[field.name]
        const helperText = typeof fieldError?.message === 'string' ? fieldError.message : ''
        const fieldId = `field-${String(field.name)}`

        return (
          <div key={field.name} className={field.className} role='group' aria-labelledby={`${fieldId}-label`}>
            <label htmlFor={fieldId} id={`${fieldId}-label`} style={{ display: 'block' }}>
              <Typography
                component='span'
                sx={{
                  color: '#000000',
                  fontSize: effectiveLabelFontSize,
                  fontWeight: labelFontWeight,
                  mb: 0.8,
                }}
              >
                {field.label}
              </Typography>
            </label>

            {field.select ? (
              <Controller
                control={control}
                name={field.name}
                rules={field.rules}
                render={({ field: controlledField }) =>
                  renderSelectField(field, helperText, controlledField, fieldId)
                }
              />
            ) : (
              <TextField
                id={fieldId}
                error={Boolean(fieldError)}
                fullWidth
                helperText={helperText}
                FormHelperTextProps={{ id: `${fieldId}-helper` }}
                inputProps={{ 'aria-describedby': `${fieldId}-helper` }}
                placeholder={field.placeholder}
                size='small'
                type={field.type ?? 'text'}
                disabled={field.disabled}
                multiline={field.multiline}
                rows={field.rows ?? 4}
                {...register(field.name, field.rules)}
                sx={getSharedFieldSx()}
              />
            )}
          </div>
        )
      })}

      {children ? children({ methods }) : null}
    </form>
  )
}
