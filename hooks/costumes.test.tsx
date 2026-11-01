import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  plugin: 'costumes',
  component: 'Pane',
  requestId: 'wardrobe',
  props: {
    title: 'Гардероб Claude',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

const band = (isWorking: boolean) =>
  ({
    plugin: 'costumes',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking,
      maxRows: 12,
      bodyColumns: 80,
      scroll: { offset: 0, bodyRows: 11 },
      view: {},
    },
  }) as const

const engine = (on: any) => {
  mock.store(on)
  on('command.register', (_: unknown, e: { name: string }) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('prompt.submit', (_: unknown, e: { text: string; context?: string[] }) => ({
    text: e.text,
    context: e.context,
  }))
}

test('костюм выбирается в гардеробе и не трогает сообщения', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'pirate' })
  expect((await ui.find({ type: 'Text', text: /Сейчас/ }))?.text).toBe('Сейчас: 🏴‍☠️ Пират')
  await ui.unmount()

  const sent = await $.prompt.submit({ text: 'привет' })
  expect(sent.text).toBe('привет')
  expect(sent.context ?? []).toEqual([])
})

test('маскот стоит на поле ввода в костюме и стучит лапками, пока Claude работает', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'costume', args: 'wizard' })

  const idle = await $.ui.mount({ ...band(false), surface: 'desktop' })
  const still = String((await idle.find({ type: 'Svg' }))?.props?.source)
  expect(still).toContain('#5b3fa8')
  expect(still).toContain('class="idle"')
  await idle.unmount()

  const busy = await $.ui.mount({ ...band(true), surface: 'desktop' })
  expect(String((await busy.find({ type: 'Svg' }))?.props?.source)).toContain('class="busy"')
  expect(await busy.find({ type: 'Button', key: 'wardrobe' })).toBeDefined()
  await busy.unmount()

  const term = await $.ui.mount({ ...band(false), surface: 'terminal' })
  expect((await term.find({ type: 'Text', text: /▐▛███▜▌/ }))?.text).toContain('🧙')
  await term.unmount()
})

const USAGE = {
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
}

const answer = (text: string) => () => ({ value: { isAnswered: true, text, usage: USAGE } })

test('/costume-sew шьёт костюм по описанию, «Распороть» его убирает', async ($, on) => {
  engine(on)
  mock.clock(on, { now: 1000 })
  const drawn = {
    emoji: '🍞',
    name: 'Батон',
    back: '',
    front: '<rect x="2" y="1" width="12" height="2" fill="#e0b070"/>',
    face: '<rect x="7" y="7" width="2" height="0.5" fill="#3a2418"/>',
  }
  let asked = ''
  on('model.complete', (_: unknown, e: { prompt: string }) => {
    asked = e.prompt
    return answer(`Вот костюм: ${JSON.stringify(drawn)}`)()
  })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  await $.command.run({ command: 'costume-sew', args: 'костюм хлеба' })
  expect(asked).toContain('костюм хлеба')

  const mascot = await $.ui.mount({ ...band(false), surface: 'desktop' })
  const suit = String((await mascot.find({ type: 'Svg' }))?.props?.source)
  // Worn over the body with the face cut out, the face layer over the eyes.
  expect(suit).toContain('<g mask="url(#face)"><rect x="2" y="1" width="12" height="2" fill="#e0b070"/></g>')
  expect(suit.indexOf('#3a2418')).toBeGreaterThan(suit.indexOf('class="eye" x="11"'))
  await mascot.unmount()

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Сейчас/ }))?.text).toBe('Сейчас: 🍞 Батон')
  await ui.press({ key: 'unpick-sewn-1000' })
  expect((await ui.find({ type: 'Text', text: /Сейчас/ }))?.text).toBe('Сейчас: без костюма')
  await ui.unmount()

  await $.command.run({ command: 'costume', args: 'cat' })
  await $.command.run({ command: 'costume', args: 'off' })
  const bare = await $.ui.mount({ ...band(false), surface: 'desktop' })
  expect(String((await bare.find({ type: 'Svg' }))?.props?.source)).not.toContain('#e0b070')
  await bare.unmount()
})

test('выкройка со скриптом или ссылкой не надевается', async ($, on) => {
  engine(on)
  mock.clock(on)
  on(
    'model.complete',
    answer(JSON.stringify({ emoji: '😈', name: 'Злой', front: '<script>alert(1)</script>' })),
  )
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  await $.command.run({ command: 'costume-sew', args: 'что-то' })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Сейчас/ }))?.text).toBe('Сейчас: без костюма')
  await ui.unmount()
})
