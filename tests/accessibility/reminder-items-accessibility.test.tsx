import React from 'react'
import { render } from '@testing-library/react-native'
import { ReminderItem } from '@/components/Reminder/ReminderItem'
import { makeReminder } from '../setup/helpers/reminder-test-factories'

describe('Acessibilidade das ações individuais de lembretes', () => {
  it('expõe nome contextual e dica para editar e remover o lembrete', async () => {
    const item = makeReminder({
      id: 'reminder-item-a11y',
      title: 'Comprar café',
      listId: 'list-a11y',
      enabled: true,
      datetimeISO: '2099-01-01T10:00:00.000Z',
    })
    const screen = await render(<ReminderItem item={item} />)

    expect(screen.getByRole('button', { name: /Editar lembrete Comprar café/ })).toBeTruthy()
    const remove = screen.getByRole('button', { name: 'Remover lembrete Comprar café' })
    expect(remove.props.accessibilityHint).toBe('Remove este lembrete')
  })
})
