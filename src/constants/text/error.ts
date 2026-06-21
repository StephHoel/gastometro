export const ERROR = {
  // UI — títulos e mensagens gerais
  alert_title: 'Erro!',
  invalid_list_format: 'A lista copiada não está no padrão. Copie a lista do WhatsApp sem editar!',
  required_fields: 'Por favor, preencha todos os campos corretamente.',
  negative_value: 'Valores negativos não são permitidos.',
  duplicate_item: 'Já existe um item com este nome na lista.',
  empty_list_name: 'O nome da lista não pode ser vazio.',
  cannot_remove_last_list: 'Não é possível remover a última lista.',

  // WhatsApp
  whatsapp_unavailable: 'WhatsApp não disponível',
  whatsapp_open_error: 'Não foi possível abrir o WhatsApp no dispositivo.',
  whatsapp_deep_link_error: 'Falha ao abrir deep link do WhatsApp, tentando fallback web.',
  whatsapp_open_failure_message: 'Erro ao abrir WhatsApp:',

  // Notificações — permissão
  notification_permission_failure: 'Falha ao carregar status de permissão de notificação:',
  notification_permission_read_failure: 'Falha ao ler permissão de notificação:',
  notification_permission_request_failure: 'Falha ao solicitar permissão de notificação:',

  // Notificações — agendamento e cancelamento
  notification_schedule_failure: 'Falha ao agendar notificação local:',
  notification_cancel_failure: 'Falha ao cancelar notificação local:',
  notification_response_failure: 'Falha ao tratar resposta de notificação:',

  // Lembretes — bootstrap e validação
  reminder_bootstrap_failure: 'Falha na inicialização de lembretes:',
  reminder_list_required: 'Lembrete precisa estar vinculado a uma lista.',
  reminder_title_required: 'Título do lembrete é obrigatório.',
  reminder_invalid_datetime: 'Data/hora inválida para o lembrete.',
  reminder_past_datetime: 'Escolha uma data/hora futura para o lembrete.',

  reminder: {
    title_required: 'Título do lembrete é obrigatório.',
    past_datetime: 'Escolha uma data/hora futura para o lembrete.',
    list_required: 'Lembrete precisa estar vinculado a uma lista existente.',
    invalid_datetime: 'Data/hora inválida. Use data no formato YYYY-MM-DD e hora no formato HH:mm.',
  },

  // Clipboard
  clipboard_read_web_failure: 'Erro ao ler clipboard na web:',
  clipboard_write_web_failure: 'Erro ao escrever no clipboard na web:',
  clipboard_write_native_failure: 'Erro ao escrever no clipboard nativo:',
  clipboard_paste_failure: 'Falha ao colar lista do clipboard:',

  // Alerta
  alert_init_failure: 'Falha ao inicializar alerta customizado:',
}
