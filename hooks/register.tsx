import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Outfit } from '../types'
import { mascotSvg, mascotText } from './mascot'

const PANE = 'wardrobe'
const TITLE = 'Гардероб Claude'
const current = atom({ plugin: 'costumes', key: 'current' } as const, null)

// Purely cosmetic: an outfit dresses the mascot above the prompt and never
// touches what Claude writes.
export const WARDROBE: readonly Outfit[] = [
  { id: 'cat', emoji: '🐱', name: 'Котик' },
  { id: 'pirate', emoji: '🏴‍☠️', name: 'Пират' },
  { id: 'butler', emoji: '🎩', name: 'Дворецкий' },
  { id: 'wizard', emoji: '🧙', name: 'Волшебник' },
  { id: 'anime', emoji: '🌸', name: 'Аниме' },
  { id: 'poet', emoji: '📜', name: 'Поэт' },
  { id: 'detective', emoji: '🕵️', name: 'Детектив' },
  { id: 'captain', emoji: '🚀', name: 'Капитан звездолёта' },
  { id: 'bear', emoji: '🧸', name: 'Мишка' },
  { id: 'courtier', emoji: '👑', name: 'Придворный' },
]

const find = (query: string): Outfit | undefined => {
  const q = query.trim().toLowerCase()

  return WARDROBE.find(o => o.id === q || o.name.toLowerCase() === q)
}

const wear = async ($: EngineInterface, outfit: Outfit | null) => {
  await update($, current, () => outfit)
  await $.store.set('current', outfit)
}

const openWardrobe = ($: EngineInterface) => $.ui.open({ id: PANE, title: TITLE })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'costume',
      description: 'Открыть гардероб маскота Claude или надеть костюм',
      argumentHint: '[костюм | off]',
    })
    await $.command.register({
      name: 'costume-sew',
      description: 'Сшить свой костюм: эмодзи, которое маскот наденет как шляпу',
      argumentHint: '<эмодзи>',
    })

    // Earlier versions showed the outfit in the status line.
    $.ui.status(undefined)
    const saved = (await $.store.get('current')) as Outfit | null | undefined
    if (saved) {
      await wear($, { id: saved.id, emoji: saved.emoji, name: saved.name })
    }

    return next(e)
  })

  on('command.run', { command: 'costume' }, async ($, e) => {
    const arg = e.args.trim()
    if (!arg) {
      await openWardrobe($)

      return { text: 'Гардероб открыт — выбирай костюм.' }
    }
    if (arg === 'off' || arg.toLowerCase() === 'снять') {
      await wear($, null)

      return { text: 'Костюм снят.' }
    }
    const outfit = find(arg)
    if (!outfit) {
      return {
        text: `Такого костюма нет. Есть: ${WARDROBE.map(o => o.id).join(', ')}`,
      }
    }
    await wear($, outfit)

    return { text: `Маскот надел костюм: ${outfit.emoji} ${outfit.name}` }
  })

  on('command.run', { command: 'costume-sew' }, async ($, e) => {
    const emoji = e.args.trim()
    if (!emoji || [...emoji].length > 8) {
      return { text: 'Дай одно эмодзи: /costume-sew 🎃' }
    }
    const outfit: Outfit = { id: 'custom', emoji, name: 'Свой костюм' }
    await $.store.set('custom', outfit)
    await wear($, outfit)

    return { text: `Сшито и надето: ${emoji}` }
  })

  // The mascot stands on the prompt box, tapping its paws while Claude works.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || e.props.view.agentId !== undefined) {
      return next(e)
    }
    const elements = $.ui.resolve(e)
    const { Box, Button, Text } = elements
    // The terminal's table holds no real Svg: it gets Claude Code's glyph mascot.
    const Svg = e.surface !== 'terminal' && 'Svg' in elements ? elements.Svg : undefined
    const worn = await read($, current)
    const look = { outfitId: worn?.id ?? null, emoji: worn?.emoji, isBusy: e.props.isWorking }

    return (
      <Box flexDirection="row" justifyContent="flex-end" alignItems="flex-end" gap={1}>
        <Button key="wardrobe" plain dimColor onPress={() => openWardrobe($)}>
          👗
        </Button>
        {Svg ? (
          <Svg
            source={mascotSvg(look)}
            alt={`Маскот Claude${worn ? ` в костюме «${worn.name}»` : ''}`}
            width={84}
            height={70}
            isInteractive
          />
        ) : (
          <Text color="#D97757">{`${worn ? `${worn.emoji}\n` : ''}${mascotText.join('\n')}`}</Text>
        )}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const worn = await read($, current)
    const custom = (await $.store.get('custom')) as Outfit | undefined
    const outfits = custom ? [...WARDROBE, custom] : WARDROBE

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>
          Сейчас: {worn ? `${worn.emoji} ${worn.name}` : 'без костюма'}
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          {outfits.map(outfit => (
            <Button
              key={outfit.id}
              variant={worn?.id === outfit.id ? 'primary' : undefined}
              onPress={() => wear($, outfit)}
            >
              {outfit.emoji} {outfit.name}
            </Button>
          ))}
        </Box>
        <Button key="off" dimColor onPress={() => wear($, null)}>
          Снять костюм
        </Button>
        <Text dimColor>Свой костюм: /costume-sew 🎃</Text>
      </Box>
    )
  })
}
