type RecoveryListener = (message: string | null) => void

let messages: string[] = []
const listeners = new Set<RecoveryListener>()

function notify() {
  const message = messages.join('\n\n')
  listeners.forEach((listener) => listener(message || null))
}

export const PersistenceRecoveryService = {
  report(message: string) {
    if (!messages.includes(message)) messages = [...messages, message]
    notify()
  },

  getMessage(): string | null {
    return messages.length > 0 ? messages.join('\n\n') : null
  },

  dismiss() {
    messages = []
    notify()
  },

  subscribe(listener: RecoveryListener): () => void {
    listeners.add(listener)
    listener(this.getMessage())
    return () => {
      listeners.delete(listener)
    }
  },
}
