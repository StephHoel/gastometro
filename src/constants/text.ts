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
    whatsapp_open_failure_message: 'Erro ao abrir WhatsApp:'
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
    confirm_remove_message: (name: string) => `Deseja remover a lista "${name}"? Todos os itens serão perdidos.`,
    confirm_remove_button: 'Remover',
    rename_save: 'Salvar',
    rename_cancel: 'Cancelar',
  },
}

