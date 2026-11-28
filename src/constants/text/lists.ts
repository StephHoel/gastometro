export const LISTS = {
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
}
