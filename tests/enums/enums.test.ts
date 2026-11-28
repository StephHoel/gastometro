import { NameField } from '@/enums/NameField'
import { PermissionState } from '@/enums/PermissionState'
import { ReminderState } from '@/enums/ReminderState'
import { ReminderStatus } from '@/enums/ReminderStatus'

describe('Enums', () => {
  it('NameField tem os valores corretos', () => {
    expect(NameField.Item).toBe('Item')
    expect(NameField.Quantity).toBe('Quantidade')
    expect(NameField.Price).toBe('Preço')
    expect(NameField.Unit).toBe('Unidade')
    expect(NameField.Title).toBe('Título')
    expect(NameField.Date).toBe('Data')
    expect(NameField.Time).toBe('Hora')
  })

  it('PermissionState tem os valores corretos', () => {
    expect(PermissionState.Granted).toBe('granted')
    expect(PermissionState.Denied).toBe('denied')
    expect(PermissionState.Undetermined).toBe('undetermined')
    expect(PermissionState.Unavailable).toBe('unavailable')
  })

  it('ReminderState tem os valores corretos', () => {
    expect(ReminderState.Enable).toBe('enabled')
    expect(ReminderState.NoPermission).toBe('no-permission')
    expect(ReminderState.NotFound).toBe('not-found')
  })

  it('ReminderStatus tem os valores corretos', () => {
    expect(ReminderStatus.Scheduled).toBe('Ativo e agendado')
    expect(ReminderStatus.NotScheduled).toBe('Ativo, mas não agendado')
    expect(ReminderStatus.Disabled).toBe('Desativado')
    expect(ReminderStatus.Overdue).toBe('Vencido')
  })
})
