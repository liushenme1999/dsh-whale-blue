import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { readAsarFile, replaceAsarFile } from '../lib/asar.mjs'
import { paintWelcomeMark } from '../lib/desktop.mjs'
import { decodeIco, encodeIco, transformIco } from '../lib/ico.mjs'
import { decodePng, encodePng } from '../lib/png.mjs'
import { hasPluginRow, installPluginRow, pluginDir, removePluginRow } from '../lib/profile.mjs'
import { parseColor, recolorRgba } from '../lib/recolor.mjs'

/** @returns {Buffer} a small deterministic RGBA image. */
function sampleImage(width = 4, height = 3) {
  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = 20
    rgba[i * 4 + 1] = 24
    rgba[i * 4 + 2] = 32
    rgba[i * 4 + 3] = 255
  }
  rgba[0] = 240
  rgba[1] = 240
  rgba[2] = 240
  return rgba
}

test('png survives an encode/decode round trip', () => {
  const rgba = sampleImage()
  const png = encodePng({ width: 4, height: 3, rgba })
  const decoded = decodePng(png)
  assert.equal(decoded.width, 4)
  assert.equal(decoded.height, 3)
  assert.deepEqual(decoded.rgba, rgba)
})

test('recolor maps dark pixels and leaves light ones alone', () => {
  const rgba = Buffer.from([20, 24, 32, 255, 240, 240, 240, 255, 0, 0, 0, 0])
  const blue = parseColor('#4d6bfe')
  const out = recolorRgba(rgba, blue)
  assert.deepEqual([...out.subarray(0, 3)], [77, 107, 254])
  assert.deepEqual([...out.subarray(4, 7)], [240, 240, 240])
  assert.deepEqual([...out.subarray(8, 11)], [0, 0, 0])
  assert.equal(out[11], 0)
})

test('recolor fades antialiased edges towards white', () => {
  const rgba = Buffer.from([136, 136, 136, 255])
  const out = recolorRgba(rgba, parseColor('#4d6bfe'), { body: 72, paper: 200 })
  assert.ok(out[0] > 77 && out[0] < 255, 'red channel sits between the brand color and white')
  assert.ok(out[2] >= 254)
})

test('welcome mark keeps its byte length and repaints only the whale', () => {
  const svg = Buffer.from(
    '<svg><style>:root{--dsw-alias-label-primary:#0f1115}</style>' +
      '<path d="M1 1h2v2H1z" fill="var(--dsw-alias-label-primary)"/>' +
      '<g clip-path="url(#c)"><path d="M3 3h2v2H3z" fill="var(--dsw-alias-label-primary)"/></g>' +
      '<g clip-path="url(#d)"><path d="M5 5h2v2H5z" fill="var(--dsw-alias-label-primary)"/></g></svg>',
  )
  const next = paintWelcomeMark(svg, parseColor('#4d6bfe'))
  assert.equal(next.length, svg.length)
  const text = next.toString('utf8')
  assert.match(text, /fill="rgb\(77,107,254\s*\)"/)
  assert.equal((text.match(/fill="var\(--dsw-alias-label-primary\)"/g) ?? []).length, 2)
  assert.match(text, /<style>:root\{--dsw-alias-label-primary:#0f1115\}<\/style>/)
})

test('welcome mark refuses artwork without the expected whale group', () => {
  const svg = Buffer.from('<svg><path d="M0 0h1v1H0z" fill="#000"/></svg>')
  assert.throws(() => paintWelcomeMark(svg, parseColor('#4d6bfe')), /whale fill not found/)
})

test('ico round trips every frame and can be recolored', () => {
  const frames = [
    { width: 16, height: 16, png: encodePng({ width: 16, height: 16, rgba: sampleImage(16, 16) }) },
    { width: 32, height: 32, png: encodePng({ width: 32, height: 32, rgba: sampleImage(32, 32) }) },
  ]
  const ico = encodeIco(frames)
  const parsed = decodeIco(ico)
  assert.deepEqual(parsed.map((frame) => [frame.width, frame.height]), [[16, 16], [32, 32]])

  const recolored = transformIco(ico, (rgba) => recolorRgba(rgba, parseColor('#4d6bfe')))
  const framesAfter = decodeIco(recolored)
  assert.equal(framesAfter.length, 2)
  const pixel = decodePng(framesAfter[1].png).rgba
  assert.deepEqual([...pixel.subarray(0, 3)], [240, 240, 240], 'the light corner stays light')
  const dark = decodePng(framesAfter[1].png).rgba.subarray((32 * 32 - 1) * 4, (32 * 32 - 1) * 4 + 3)
  assert.deepEqual([...dark], [77, 107, 254])
})

test('asar entries can be read and replaced in place, and length changes are rejected', () => {
  const dir = mkdtempSync(join(tmpdir(), 'whale-asar-'))
  try {
    const archive = join(dir, 'test.asar')
    const payload = Buffer.from('hello whale')
    const header = JSON.stringify({ files: { a: { files: { 'b.txt': { size: payload.length, offset: '0' } } } } })
    const headerSize = Buffer.byteLength(header)
    const prefix = Buffer.alloc(16)
    prefix.writeUInt32LE(4, 0)
    prefix.writeUInt32LE(headerSize + 8, 4)
    prefix.writeUInt32LE(headerSize + 4, 8)
    prefix.writeUInt32LE(headerSize, 12)
    writeFileSync(archive, Buffer.concat([prefix, Buffer.from(header), payload]))

    assert.equal(readAsarFile(archive, 'a/b.txt').toString('utf8'), 'hello whale')
    replaceAsarFile(archive, 'a/b.txt', (original) => Buffer.from('HELLO WHALE'))
    assert.equal(readAsarFile(archive, 'a/b.txt').toString('utf8'), 'HELLO WHALE')
    assert.throws(() => replaceAsarFile(archive, 'a/b.txt', () => Buffer.from('short')), /byte length/)
    assert.equal(readAsarFile(archive, 'a/b.txt').toString('utf8'), 'HELLO WHALE')
    assert.throws(() => readAsarFile(archive, 'nope.txt'), /not found/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('profile row is installed idempotently and removed cleanly', () => {
  const dir = mkdtempSync(join(tmpdir(), 'whale-profile-'))
  try {
    const home = join(dir, 'home')
    const profile = 'desktop'
    mkdirSync(join(home, 'profiles', profile), { recursive: true })
    writeFileSync(join(home, 'profiles', profile, 'package.json'), '{"name":"profile"}\n')
    writeFileSync(join(home, 'profiles', profile, 'cordis.patch.yml'), '- id: keep\n  name: "keep"\n')
    const source = join(dir, 'index.js')
    writeFileSync(source, 'export function apply() {}\n')

    const log = () => {}
    installPluginRow({ dshHome: home, profile, source, light: '#4d6bfe', dark: '#7aaaff', log })
    installPluginRow({ dshHome: home, profile, source, light: '#4d6bfe', dark: '#7aaaff', log })

    const patch = readFileSync(join(home, 'profiles', profile, 'cordis.patch.yml'), 'utf8')
    assert.equal((patch.match(/dsh-whale-blue:start/g) ?? []).length, 1, 'installing twice keeps one block')
    assert.match(patch, /- id: keep/, 'the user rows survive')
    assert.match(patch, /light: "#4d6bfe"/)
    assert.ok(hasPluginRow(home, profile))
    assert.ok(readFileSync(join(pluginDir(home, profile), 'index.mjs'), 'utf8').includes('apply'))

    removePluginRow({ dshHome: home, profile, log })
    assert.equal(hasPluginRow(home, profile), false)
    const after = readFileSync(join(home, 'profiles', profile, 'cordis.patch.yml'), 'utf8')
    assert.match(after, /- id: keep/)
    assert.doesNotMatch(after, /whale-blue/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
