import { expect, test } from '@playwright/test'

import {
  buildNewClientInitialForm,
  getNewClientRequiredScrollTarget,
  hasNewClientDraftContent,
  hasRequiredNewClientFields,
} from 'components/clients/new/newClientFormUtils'

test('new client helpers build the initial form and track draft content', async () => {
  const initialForm = buildNewClientInitialForm()

  expect(initialForm).toEqual({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    notes: '',
  })

  expect(
    hasNewClientDraftContent({
      form: initialForm,
      selectedGroupIds: [],
    })
  ).toBe(false)

  expect(
    hasNewClientDraftContent({
      form: initialForm,
      selectedGroupIds: [1],
    })
  ).toBe(true)
})

test('new client helpers validate required fields and scroll targets', async () => {
  expect(hasRequiredNewClientFields(buildNewClientInitialForm())).toBe(false)
  expect(
    hasRequiredNewClientFields({
      firstName: 'Avery',
      lastName: 'Stone',
      email: '',
      phone: '',
      birthday: '',
      notes: '',
    })
  ).toBe(true)

  expect(getNewClientRequiredScrollTarget(undefined)).toBeNull()
  expect(getNewClientRequiredScrollTarget(8)).toBe(0)
  expect(getNewClientRequiredScrollTarget(28)).toBe(16)
})
