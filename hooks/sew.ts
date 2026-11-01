// Sewing: a model draws a new outfit for the mascot from a description.
// What it answers is held to a few plain SVG shapes before it is drawn.

import type { OutfitArt } from './mascot'
import { FACE, OUTFITS } from './mascot'

export type Sewn = { emoji: string; name: string; art: OutfitArt }

export const SEW_SYSTEM = `Ты художник пиксель-арта и шьёшь костюмы для маскота Claude Code: оранжевого (#D97757) пиксельного существа.

Система координат SVG (единица = 1 пиксель маскота), видимая область: x от -4 до 20, y от -8 до 12.
Тело маскота рисуется само — не перерисовывай его, а одевай:
- туловище: прямоугольник x 2..14, y 3..9 (верх головы — y=3);
- лапки-руки: x 0..2 и x 14..16, y 5..7;
- ножки: четыре столбика шириной 1 при x = 3, 5, 10, 12, y 9..11;
- глаза: чёрные прямоугольники 1×2 при x=4 и x=11, y 5..7.
Над головой свободно (y от -8 до 3) — место для шляп, ушей, корон. В руках (около x=-2 или x=17..19) — предметы.

Рисуй только элементы rect, circle, ellipse, polygon, polyline, line, path, g, text.
Без style, script, ссылок, градиентов, фильтров и обработчиков. Цвета — шестнадцатеричные (#rrggbb).
Линии тонкие: stroke-width от 0.15 до 0.6. Делай 4–15 фигур, узнаваемо и мило.
Можно оживить классами: class="twinkle" (мерцание), class="sway" (покачивание сверху), class="tail" (виляние вокруг точки 14,8), class="beacon" (мигание).

Костюм НАДЕВАЕТСЯ на маскота, а лицо остаётся открытым. Три слоя:
- "front" — сам костюм поверх тела: шляпа, капюшон, комбинезон, панцирь, плащ, рукава на лапках, ботинки на ножках. Закрашивай им тело смело, целиком, как одежду. Лицо (прямоугольник x ${FACE.x}..${(FACE.x + FACE.width).toFixed(1)}, y ${FACE.y}..${(FACE.y + FACE.height).toFixed(1)}) из этого слоя всё равно будет вырезано — получится вырез под мордочку, как у капюшона или ростовой куклы.
- "face" — то, что надевается на лицо поверх глаз: очки, монокль, усы, нос, румянец, маска. Маленькое и аккуратное; пусто, если не нужно. Глаза не перекрывай целиком, если костюм этого не требует.
- "back" — то, что позади тела: хвост, крылья, спинка плаща, предмет в лапке. Пусто, если не нужно.
Пример ростового костюма «динозавр»: в "front" — зелёный комбинезон поверх всего тела x 1.6..14.4, y 2.6..9.4 и зелёные чулки на ножках, шипы сверху на голове; в "back" — хвост; "face" — пусто.
Если костюм закрывает левый глаз (повязка), поставь "hideLeftEye": true.

Ответь одним JSON-объектом без пояснений и без markdown:
{"emoji": "<одно эмодзи>", "name": "<короткое название по-русски>", "back": "<svg-фрагмент или пустая строка>", "front": "<svg-фрагмент>", "face": "<svg-фрагмент или пустая строка>", "hideLeftEye": false}

Ниже примеры аксессуаров (для стиля и координат; твой костюм может закрывать тело гораздо больше).

Пример — костюм волшебника:
${JSON.stringify({ emoji: '🧙', name: 'Волшебник', back: OUTFITS.wizard?.back?.trim() ?? '', front: OUTFITS.wizard?.front.trim() ?? '' })}

Пример — костюм котика:
${JSON.stringify({ emoji: '🐱', name: 'Котик', back: OUTFITS.cat?.back?.trim() ?? '', front: OUTFITS.cat?.front.trim() ?? '' })}`

export const sewPrompt = (description: string) =>
  `Сшей костюм по описанию: ${description}`

const TAGS = new Set(['rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'path', 'g', 'text'])
const LIMIT = 8000

// Keeps a fragment of plain shapes; anything else (script, links, styles,
// handlers, nested documents) refuses the whole fragment.
export const cleanFragment = (svg: unknown): string | null => {
  if (typeof svg !== 'string') {
    return null
  }
  const text = svg.trim()
  if (text.length > LIMIT) {
    return null
  }
  for (const [, tag] of text.matchAll(/<\/?\s*([a-zA-Z][\w:-]*)/g)) {
    if (!TAGS.has((tag ?? '').toLowerCase())) {
      return null
    }
  }
  if (/<!|<\?|\son[a-z]+\s*=|href|url\s*\(|javascript:|style\s*=|@import/i.test(text)) {
    return null
  }

  return text
}

// The model's reply as an outfit, or null when it is not one we can draw.
export const parseSewn = (reply: string): Sewn | null => {
  const start = reply.indexOf('{')
  const end = reply.lastIndexOf('}')
  if (start < 0 || end <= start) {
    return null
  }
  let data: Record<string, unknown>
  try {
    data = JSON.parse(reply.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return null
  }
  const front = cleanFragment(data.front)
  const optional = (value: unknown) =>
    value === undefined || value === null || value === '' ? '' : cleanFragment(value)
  const back = optional(data.back)
  const face = optional(data.face)
  if (!front || back === null || face === null) {
    return null
  }
  const emoji = typeof data.emoji === 'string' && [...data.emoji].length <= 8 ? data.emoji : '🪡'
  const name = typeof data.name === 'string' && data.name.trim() ? data.name.trim().slice(0, 40) : 'Свой костюм'
  const art: OutfitArt = { front }
  if (back) {
    art.back = back
  }
  if (face) {
    art.face = face
  }
  if (data.hideLeftEye === true) {
    art.hideLeftEye = true
  }

  return { emoji, name, art }
}
