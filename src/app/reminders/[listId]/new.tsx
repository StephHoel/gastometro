import React from 'react'
import { FormReminder } from '@/components/Form/Reminder'
import { Page } from '@/components/Page'
import { getListIdParam } from '@/hooks/getParams'
import { AddIcon } from '@/components/Icons'
import { COLORS } from '@/constants/color'
import { REMINDERS } from '@/constants/text/reminders'
import { SIZE } from '@/constants/size'

export default function NewReminder() {
  const listId = getListIdParam()

  return (
    <Page>
      <FormReminder
        listId={listId}
        textButton={REMINDERS.button.create}
        iconButton={<AddIcon color={COLORS.black} size={SIZE.iconButton} />}
      />
    </Page>
  )
}