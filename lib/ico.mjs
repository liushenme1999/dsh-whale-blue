/**
 * Minimal ICO container codec for PNG-compressed icon entries (Windows Vista
 * and later). Enough to recolor every frame of the desktop shell's tray icon;
 * legacy BMP entries are rejected with a clear message instead of being mangled.
 */

import { decodePng, encodePng, isPng } from './png.mjs'

/**
 * Parse an ICO file into its frames.
 * @param {Buffer} buffer - ICO bytes.
 * @returns {{ width: number, height: number, png: Buffer }[]} one PNG per frame, in file order.
 */
export function decodeIco(buffer) {
  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    throw new Error('not an ICO file')
  }
  const count = buffer.readUInt16LE(4)
  const frames = []
  for (let i = 0; i < count; i++) {
    const entry = 6 + i * 16
    if (entry + 16 > buffer.length) throw new Error('ICO directory is truncated')
    const width = buffer[entry] === 0 ? 256 : buffer[entry]
    const height = buffer[entry + 1] === 0 ? 256 : buffer[entry + 1]
    const size = buffer.readUInt32LE(entry + 8)
    const offset = buffer.readUInt32LE(entry + 12)
    const blob = buffer.subarray(offset, offset + size)
    if (!isPng(blob)) {
      throw new Error(`ICO frame ${i} (${width}x${height}) is a BMP entry; only PNG entries are supported`)
    }
    frames.push({ width, height, png: blob })
  }
  return frames
}

/**
 * Serialize frames back into an ICO container, preserving their order and size.
 * @param {{ width: number, height: number, png: Buffer }[]} frames - frames from {@link decodeIco}, possibly recolored.
 * @returns {Buffer} ICO bytes.
 */
export function encodeIco(frames) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(frames.length, 4)

  const directory = Buffer.alloc(16 * frames.length)
  const payloads = []
  let offset = 6 + directory.length
  frames.forEach((frame, index) => {
    const entry = index * 16
    directory[entry] = frame.width >= 256 ? 0 : frame.width
    directory[entry + 1] = frame.height >= 256 ? 0 : frame.height
    directory[entry + 2] = 0
    directory[entry + 3] = 0
    directory.writeUInt16LE(1, entry + 4)
    directory.writeUInt16LE(32, entry + 6)
    directory.writeUInt32LE(frame.png.length, entry + 8)
    directory.writeUInt32LE(offset, entry + 12)
    payloads.push(frame.png)
    offset += frame.png.length
  })

  return Buffer.concat([header, directory, ...payloads])
}

/**
 * Recolor every frame of an ICO through a shared pixel mapper.
 * @param {Buffer} buffer - ICO bytes.
 * @param {(rgba: Buffer) => Buffer} map - receives decoded RGBA, returns recolored RGBA.
 * @returns {Buffer} recolored ICO.
 */
export function transformIco(buffer, map) {
  const frames = decodeIco(buffer).map((frame) => {
    const image = decodePng(frame.png)
    return { width: frame.width, height: frame.height, png: encodePng({ ...image, rgba: map(image.rgba) }) }
  })
  return encodeIco(frames)
}
