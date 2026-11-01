import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Outfit } from '../types'
import { mascotSvg, mascotText } from './mascot'
import { parseSewn, SEW_SYSTEM, sewPrompt } from './sew'

const PANE = 'wardrobe'
const TITLE = 'Гардероб Claude'
const SEWN_LIMIT = 12
const current = atom({ plugin: 'costumes', key: 'current' } as const, null)
const isSewing = atom({ plugin: 'costumes', key: 'isSewing' } as const, false)

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

const sewnList = async ($: EngineInterface) =>
  ((await $.store.get('sewn')) as Outfit[] | undefined) ?? []

// Asks a model to draw the outfit described, keeps it among the sewn ones
// and dresses the mascot in it; answers what to tell the person.
const sew = async ($: EngineInterface, description: string): Promise<string> => {
  if (await read($, isSewing)) {
    return 'Уже шью другой костюм, подожди немного.'
  }
  await update($, isSewing, () => true)
  $.ui.toast('🪡 Шью костюм…')
  try {
    const reply = await $.model.complete({
      model: 'sonnet',
      system: SEW_SYSTEM,
      prompt: sewPrompt(description),
      maxTokens: 4000,
      effort: 'low',
      timeoutMs: 120_000,
    })
    if (!reply.isAnswered) {
      return 'Не получилось сшить: модель не ответила. Попробуй ещё раз.'
    }
    const sewn = parseSewn(reply.text)
    if (!sewn) {
      return 'Не получилось сшить: выкройка вышла кривая. Попробуй ещё раз или опиши иначе.'
    }
    const outfit: Outfit = { id: `sewn-${await $.clock.now()}`, ...sewn }
    const list = [...(await sewnList($)), outfit].slice(-SEWN_LIMIT)
    await $.store.set('sewn', list)
    await wear($, outfit)

    return `Сшито и надето: ${outfit.emoji} ${outfit.name}`
  } finally {
    await update($, isSewing, () => false)
  }
}

const unpick = async ($: EngineInterface, outfit: Outfit) => {
  await $.store.set('sewn', (await sewnList($)).filter(o => o.id !== outfit.id))
  if ((await read($, current))?.id === outfit.id) {
    await wear($, null)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'costume',
      description: 'Открыть гардероб маскота Claude или надеть костюм',
      argumentHint: '[костюм | off]',
    })
    await $.command.register({
      name: 'costume-sew',
      description: 'Сшить новый костюм маскоту по описанию',
      argumentHint: '<описание>',
    })

    // Earlier versions showed the outfit in the status line.
    $.ui.status(undefined)
    const saved = (await $.store.get('current')) as Outfit | null | undefined
    if (saved) {
      await wear($, saved)
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
    const description = e.args.trim()
    if (!description) {
      return { text: 'Опиши костюм: /costume-sew космический ковбой с лассо' }
    }

    return { text: await sew($, description) }
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
    const look = {
      outfitId: worn?.id ?? null,
      emoji: worn?.emoji,
      art: worn?.art,
      isBusy: e.props.isWorking || (await read($, isSewing)),
    }

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
    const elements = $.ui.resolve(e)
    const { Box, Button, Text } = elements
    const Input = e.surface !== 'mobile' && 'Input' in elements ? elements.Input : undefined
    const worn = await read($, current)
    const sewing = await read($, isSewing)
    const sewn = await sewnList($)

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>
          Сейчас: {worn ? `${worn.emoji} ${worn.name}` : 'без костюма'}
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          {WARDROBE.map(outfit => (
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

        <Text bold>Сшитые костюмы</Text>
        {sewn.length === 0 && <Text dimColor>Пока ничего не сшито.</Text>}
        {sewn.map(outfit => (
          <Box key={`row-${outfit.id}`} flexDirection="row" gap={1}>
            <Button
              key={outfit.id}
              variant={worn?.id === outfit.id ? 'primary' : undefined}
              onPress={() => wear($, outfit)}
            >
              {outfit.emoji} {outfit.name}
            </Button>
            <Button key={`unpick-${outfit.id}`} dimColor onPress={() => unpick($, outfit)}>
              Распороть
            </Button>
          </Box>
        ))}
        {sewing ? (
          <Text>🪡 Шью костюм…</Text>
        ) : Input ? (
          <Input
            key="sew"
            label="Сшить новый"
            placeholder="Опиши костюм: космический ковбой с лассо"
            submitLabel="Сшить"
            onSubmit={async description => {
              if (description.trim()) {
                $.ui.toast(await sew($, description.trim()))
              }
            }}
          />
        ) : (
          <Text dimColor>Сшить новый: /costume-sew описание</Text>
        )}
      </Box>
    )
  })
}
