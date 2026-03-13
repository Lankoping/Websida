'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

function isSwedishRequest() {
  const country =
    (getRequestHeader('cf-ipcountry') ||
      getRequestHeader('x-vercel-ip-country') ||
      getRequestHeader('x-country-code') ||
      '')
      .trim()
      .toLowerCase()

  if (country === 'se') {
    return true
  }

  const acceptLanguage = (getRequestHeader('accept-language') || '').toLowerCase()
  return acceptLanguage.includes('sv')
}

export const getDataPolicyPathFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    return isSwedishRequest() ? '/datapolicy/se' : '/datapolicy/en'
  })
