export type Outfit = { id: string; emoji: string; name: string }

declare module 'claude-code' {
  interface PluginState {
    costumes: { current: Outfit | null; isBusy: boolean }
  }
}
