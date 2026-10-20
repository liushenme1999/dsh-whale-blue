/**
 * Minimal PNG codec for 8-bit, non-interlaced images — enough to recolor the
 * icons shipped with the DeepSeek Harness desktop shell without adding a
 * dependency. Decoding normalizes to RGBA; encoding always writes RGBA.
 */

import { deflateSync, inflateSync } from 'node:zlib'

/** 8-byte PNG signature. */
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** Lazily built CRC-32 table (PNG chunk checksums). */
let crcTable

/** @returns {Int32Array} the 256-entry CRC table. */
function getCrcTable() {
  if (crcTable) return crcTable
  crcTable = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crcTable[n] = c
  }
  return crcTable
}

/**
 * CRC-32 of a buffer, as PNG stores it.
 * @param {Buffer} buffer - bytes to checksum.
 * @returns {number} unsigned CRC.
 */
function crc32(buffer) {
  const table = getCrcTable()
  let c = -1
  for (let i = 0; i < buffer.length; i++) c = table[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

/**
 * Serialize one PNG chunk.
 * @param {string} type - four-character chunk type.
 * @param {Buffer} data - chunk payload.
 * @returns {Buffer} length + type + data + CRC.
 */
function chunk(type, data) {
  const head = Buffer.alloc(8)
  head.writeUInt32BE(data.length, 0)
  head.write(type, 4, 'latin1')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0)
  return Buffer.concat([head, data, crc])
}

/**
 * Predict the Paeth filter byte.
 * @param {number} a - left.
 * @param {number} b - above.
 * @param {number} c - upper left.
 * @returns {number} prediction.
 */
function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  return pb <= pc ? b : c
}

/** @param {Buffer} buffer - candidate bytes. */
export function isPng(buffer) {
  return buffer.length >= 8 && buffer.subarray(0, 8).equals(SIGNATURE)
}

/**
 * Decode a PNG into RGBA8 pixels.
 * @param {Buffer} buffer - PNG bytes.
 * @returns {{ width: number, height: number, rgba: Buffer, ancillary: { type: string, data: Buffer }[] }} image.
 */
export function decodePng(buffer) {
  if (!isPng(buffer)) throw new Error('not a PNG file')

  let header
  const idat = []
  const ancillary = []
  let pos = 8
  while (pos + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(pos)
    const type = buffer.toString('latin1', pos + 4, pos + 8)
    const data = buffer.subarray(pos + 8, pos + 8 + length)
    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12],
      }
    } else if (type === 'IDAT') {
      idat.push(Buffer.from(data))
    } else if (type !== 'IEND' && !type.startsWith('tEXt')) {
      // Keep color-space / density hints; drop text chunks so encoders stay quiet.
      ancillary.push({ type, data: Buffer.from(data) })
    }
    pos += length + 12
    if (type === 'IEND') break
  }
  if (header === undefined) throw new Error('PNG has no IHDR chunk')
  if (header.bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${header.bitDepth}`)
  if (header.interlace !== 0) throw new Error('interlaced PNG is not supported')
  if (header.compression !== 0) throw new Error(`unsupported PNG compression ${header.compression}`)

  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[header.colorType]
  if (channels === undefined) throw new Error(`unsupported PNG color type ${header.colorType}`)

  const { width, height } = header
  const stride = width * channels
  const raw = inflateSync(Buffer.concat(idat))
  const expected = (stride + 1) * height
  if (raw.length < expected) throw new Error('PNG image data is truncated')

  const pixels = Buffer.alloc(stride * height)
  let previous = Buffer.alloc(stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride)
    const current = Buffer.alloc(stride)
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? current[x - channels] : 0
      const above = previous[x]
      const upperLeft = x >= channels ? previous[x - channels] : 0
      let value = line[x]
      switch (filter) {
        case 0:
          break
        case 1:
          value = (value + left) & 0xff
          break
        case 2:
          value = (value + above) & 0xff
          break
        case 3:
          value = (value + ((left + above) >> 1)) & 0xff
          break
        case 4:
          value = (value + paeth(left, above, upperLeft)) & 0xff
          break
        default:
          throw new Error(`unsupported PNG filter ${filter}`)
      }
      current[x] = value
    }
    current.copy(pixels, y * stride)
    previous = current
  }

  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const from = i * channels
    const to = i * 4
    if (channels === 1) {
      const gray = pixels[from]
      rgba[to] = gray
      rgba[to + 1] = gray
      rgba[to + 2] = gray
      rgba[to + 3] = 255
    } else if (channels === 2) {
      const gray = pixels[from]
      rgba[to] = gray
      rgba[to + 1] = gray
      rgba[to + 2] = gray
      rgba[to + 3] = pixels[from + 1]
    } else if (channels === 3) {
      rgba[to] = pixels[from]
      rgba[to + 1] = pixels[from + 1]
      rgba[to + 2] = pixels[from + 2]
      rgba[to + 3] = 255
    } else {
      pixels.copy(rgba, to, from, from + 4)
    }
  }

  return { width, height, rgba, ancillary }
}

/**
 * Encode RGBA8 pixels as a PNG.
 * @param {{ width: number, height: number, rgba: Buffer, ancillary?: { type: string, data: Buffer }[] }} image - source.
 * @returns {Buffer} PNG bytes.
 */
export function encodePng(image) {
  const { width, height, rgba } = image
  if (rgba.length !== width * height * 4) throw new Error('RGBA buffer does not match the image size')

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const parts = [SIGNATURE, chunk('IHDR', ihdr)]
  for (const extra of image.ancillary ?? []) parts.push(chunk(extra.type, extra.data))
  parts.push(chunk('IDAT', deflateSync(raw, { level: 9 })))
  parts.push(chunk('IEND', Buffer.alloc(0)))
  return Buffer.concat(parts)
}
