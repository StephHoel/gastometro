import React from 'react'
import { CustomAlert } from './CustomAlert'
import { Screen } from './Screen'
import { Header } from './Header'
import { PageProps } from '@/interfaces/PageProps'

export function Page({ children, activeListId, alertRef }: PageProps) {
  return (<>
    <CustomAlert ref={alertRef} />

    <Screen>
      <Header activeListId={activeListId} />
      {children}
    </Screen>
  </>)
}