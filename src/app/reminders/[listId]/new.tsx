import React from 'react'
import { FormReminder } from '@/components/Form/Reminder'
import { Page } from '@/components/Page'
import { useListIdParam } from '@/hooks/useParams'
import { AddIcon } from '@/components/Icons'
import { COLORS } from '@/constants/color'
import { REMINDERS } from '@/constants/text/reminders'
import { SIZE } from '@/constants/size'

export default function NewReminder() {
  const listId = useListIdParam()

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