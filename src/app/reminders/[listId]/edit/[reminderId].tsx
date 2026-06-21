import React from 'react'
import { FormReminder } from '@/components/Form/Reminder'
import { Page } from '@/components/Page'
import { useListIdParam, useReminderIdParam } from '@/hooks/useParams'
import { EditIcon } from '@/components/Icons'
import { COLORS } from '@/constants/color'
import { REMINDERS } from '@/constants/text/reminders'
import { SIZE } from '@/constants/size'

export default function EditReminder() {
  const listId = useListIdParam()
  const reminderId = useReminderIdParam()

  return (
    <Page>
      <FormReminder
        listId={listId}
        reminderId={reminderId}
        textButton={REMINDERS.button.update}
        iconButton={<EditIcon color={COLORS.black} size={SIZE.iconButton} />}
      />
    </Page>
  )
}