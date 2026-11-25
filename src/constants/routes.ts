export const ROUTES = {
  Index: "/",

  List: {
    Add: "/list/add",
    Index: "/lists",

    Edit: (listId: string) => `/list/edit/${listId}` as const,
  },

  PriceComparison: {
    Index: "/price-comparison",

    Market: {
      Add: "/price-comparison/market/add",
      Edit: (marketId: string) => `/price-comparison/market/edit/${marketId}` as const,
    },

    Cart: {
      Add: "/price-comparison/cart/add",
      Edit: (cartId: string) => `/price-comparison/cart/edit/${cartId}` as const,
    },
  },

  Reminder: {
    Index: "/reminders",

    Id: (listId: string) => `/reminders/${listId}` as const,
    New: (listId: string) => `/reminders/${listId}/new` as const,
    Edit: (listId: string, reminderId: string) => `/reminders/${listId}/edit/${reminderId}` as const,
  },
} as const