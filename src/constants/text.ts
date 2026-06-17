export const text = {
  error: {
    alert_title: "Erro!",
    invalid_list_format: "A lista copiada não está no padrão. Copie a lista do WhatsApp sem editar!",
    required_fields: 'Por favor, preencha todos os campos corretamente.',
    negative_value: 'Valores negativos não são permitidos.',
    duplicate_item: 'Já existe um item com este nome na lista.',
    empty_list_name: 'O nome da lista não pode ser vazio.',
    cannot_remove_last_list: 'Não é possível remover a última lista.',

    whatsapp_unavailable: 'WhatsApp não disponível',
    whatsapp_open_error: 'Não foi possível abrir o WhatsApp no dispositivo.',
    whatsapp_deep_link_error: 'Falha ao abrir deep link do WhatsApp, tentando fallback web.',
    whatsapp_open_failure_message: 'Erro ao abrir WhatsApp:',

    notification_permission_failure: 'Falha ao carregar status de permissão de notificação:',
    notification_permission_read_failure: 'Falha ao ler permissão de notificação:',
    notification_permission_request_failure: 'Falha ao solicitar permissão de notificação:'
  },

  buttons: {
    add: "Adicionar Item",
    edit: "Editar Item",
  },

  input: {
    placeholder: {
      item: "Item",
      quantity: "1",
      price: "1,39",
      list_name: "Nome da lista",
    }
  },

  lists: {
    imported_name: 'Lista importada',
    new_list_default: 'Nova Lista',
    add_button: 'Criar',
    empty_hint: 'Nenhuma lista criada.',
    active_label: 'ativa',
    confirm_remove_title: 'Remover lista',
    confirm_remove_message: (name: string, remindersCount = 0) =>
      remindersCount > 0
        ? `Deseja remover a lista "${name}"? ${remindersCount} lembrete(s) também serão removidos.`
        : `Deseja remover a lista "${name}"? Todos os itens serão perdidos.`,
    confirm_remove_button: 'Remover',
    rename_save: 'Salvar',
    rename_cancel: 'Cancelar',
  },

  reminders: {
    list_required: 'Lembrete precisa estar vinculado a uma lista existente.',
    invalid_datetime: 'Data/hora inválida. Use data no formato YYYY-MM-DD e hora no formato HH:mm.',
    not_found: 'Lembrete não encontrado.',
    invalid_list: 'A lista selecionada não existe mais.',
    back_to_lists: 'Voltar para listas',
    list_title: (listName: string) => `Lembretes da lista: ${listName}`,
    list_hint: 'Crie lembretes locais e ative notificações quando quiser.',
    title_placeholder: 'Título do lembrete',
    date_placeholder: 'YYYY-MM-DD',
    time_placeholder: 'HH:mm',
    create_button: 'Criar lembrete',
    update_button: 'Salvar edição',
    cancel_edit_button: 'Cancelar edição',
    empty_list: 'Nenhum lembrete para esta lista.',
    enable_button: 'Ativar',
    disable_button: 'Desativar',
    edit_button: 'Editar',
    remove_button: 'Remover',
    remove_title: 'Remover lembrete',
    remove_message: 'Deseja remover este lembrete?',
    status_scheduled: 'Ativo e agendado',
    status_not_scheduled: 'Ativo, mas não agendado',
    status_disabled: 'Desativado',
    status_overdue: 'Vencido',
    permission_title: 'Permissão de notificação negada',
    permission_denied_message:
      'O lembrete foi salvo, mas sem permissão não será notificado em segundo plano.',
    center_title: 'Central de lembretes',
    center_hint: 'Revise lembretes de todas as listas com filtros rápidos.',
    center_empty: 'Nenhum lembrete encontrado para este filtro.',
    unknown_list: 'Lista removida',
    in_list: (listName: string) => `Lista: ${listName}`,
    open_list_button: 'Abrir lista',
    open_list_reminders_button: 'Lembretes',
    open_center_button: 'Central de lembretes',
    pending_title: 'Lembretes pendentes sem notificação',
    filter_label: {
      all: 'Todos',
      enabled: 'Ativos',
      disabled: 'Desativados',
      overdue: 'Vencidos',
    },
  },
}

