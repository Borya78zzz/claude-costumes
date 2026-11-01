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

test('/costume off снимает костюм, /costume-sew надевает эмодзи', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  await $.command.run({ command: 'costume-sew', args: '🎃' })
  let ui = await $.ui.mount({ ...band(false), surface: 'desktop' })
  expect(String((await ui.find({ type: 'Svg' }))?.props?.source)).toContain('🎃')
  await ui.unmount()

  await $.command.run({ command: 'costume', args: 'off' })
  ui = await $.ui.mount({ ...band(false), surface: 'desktop' })
  expect(String((await ui.find({ type: 'Svg' }))?.props?.source)).not.toContain('🎃')
  await ui.unmount()
})
