import { t } from 'i18next'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import React, { useEffect, useState } from 'react'
import { cn } from '@/utils/misc'

interface IInputEmailProps {
  name: string
  errorMessage: string
  placeholder?: string
  callbackError?: (val: string) => void
  trigger?: 'onChange' | 'onBlur'
  required?: boolean
}

const InputEmail = ({
  name,
  errorMessage,
  placeholder = '',
  callbackError,
  trigger = 'onChange',
  required = false,
}: IInputEmailProps) => {
  const [error, setError] = useState(errorMessage)

  const onValidate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (e.target.value === '') {
      setError(t("Can't be blank"))
      callbackError?.(t("Can't be blank"))
    } else if (!emailPattern.test(e.target.value)) {
      setError(t('Must have the @ sign and no spaces'))
      callbackError?.(t('Must have the @ sign and no spaces'))
    } else {
      setError('')
      callbackError?.('')
    }
  }

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage)
    }
  }, [errorMessage])

  return (
    <>
      <Label className={cn(required && 'required')}>Email</Label>
      <Input
        name={name}
        autoComplete="off"
        onChange={(e) => {
          if (trigger === 'onChange') {
            onValidate(e)
          }
        }}
        onBlur={(e) => {
          if (trigger === 'onBlur') {
            onValidate(e)
          }
        }}
        placeholder={placeholder}
        className={cn(error && 'input-error')}
      />
      {error && <span className="error-message">{error}</span>}
    </>
  )
}

export default React.memo(InputEmail)
