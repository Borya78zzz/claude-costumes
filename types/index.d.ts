export type Outfit = {
  id: string
  emoji: string
  name: string
  // A sewn outfit's own drawing: SVG fragments behind the mascot, over its
  // body (the face cut out) and on its face.
  art?: { back?: string; front: string; face?: string; hideLeftEye?: true }
}

declare module 'claude-code' {
  interface PluginState {
    costumes: { current: Outfit | null; isSewing: boolean }
  }
}
