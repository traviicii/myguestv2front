export type ClientType = 'Cut' | 'Color' | 'Cut & Color'

export type NewClientFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthday: string
  notes: string
}

export function buildNewClientInitialForm(): NewClientFormState {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    notes: '',
  }
}

export function hasNewClientDraftContent({
  clientType,
  defaultType,
  form,
}: {
  clientType: ClientType
  defaultType: ClientType
  form: NewClientFormState
}) {
  const hasText =
    form.firstName.trim() ||
    form.lastName.trim() ||
    form.email.trim() ||
    form.phone.trim() ||
    form.birthday.trim() ||
    form.notes.trim()

  return Boolean(hasText) || clientType !== defaultType
}

export function hasRequiredNewClientFields(form: NewClientFormState) {
  return Boolean(form.firstName.trim() && form.lastName.trim())
}

export function getNewClientRequiredScrollTarget(requiredFieldY?: number) {
  if (typeof requiredFieldY !== 'number') {
    return null
  }

  return Math.max(0, requiredFieldY - 12)
}
