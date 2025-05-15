export const alert = {
  remove: {
    title: "Remover item",
    message: (itemName: string) => `Deseja remover: ${itemName}?`,
    button: {
      title: "Remover",
    },
  },

  removeAll: {
    title: "Remover Tudo",
    message: "Deseja remover todos os itens?",
    button: {
      title: "Remover Tudo!"
    }
  },

  share: {
    title: "Compartilhar Lista",
    message: "Coloque pelo menos 1 item na sua lista para que ela possa ser compartilhada.",
    buttons: {
      ok: "OK",
      whatsapp: "WhatsApp",
      paste: "Colar Lista",
    },
  },

  paste: {
    title: "Colar Lista",
    message: "",
    buttons: {
      oldList: "Colar na Lista Existente",
      newList: "Colar em Nova Lista",
    },
  },

};