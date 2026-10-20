/**
 * Just enough of the asar archive format to read one entry and rewrite it in
 * place without repacking the archive: the directory is a JSON tree in the
 * header, and every file is a byte range after it.
 *
 * In-place rewrites are deliberate — repacking a 180 MB archive to change one
 * 16 KB asset is slow and risky, and the harness's asar integrity fuse is off
 * in the desktop build, so only the bytes of that single entry change.
 */

import { closeSync, openSync, readSync, writeSync } from 'node:fs'

/**
 * Read and parse the archive header.
 * @param {number} fd - open file descriptor.
 * @returns {{ header: any, base: number }} the directory tree and the offset where file bytes start.
 */
export function readAsarHeader(fd) {
  const head = Buffer.alloc(16)
  if (readSync(fd, head, 0, 16, 0) !== 16) throw new Error('asar header is truncated')
  const headerSize = head.readUInt32LE(12)
  if (headerSize === 0 || headerSize > 64 * 1024 * 1024) throw new Error('asar header size is implausible')
  const raw = Buffer.alloc(headerSize)
  if (readSync(fd, raw, 0, headerSize, 16) !== headerSize) throw new Error('asar header is truncated')
  const text = raw.toString('utf8').replace(/\u0000+$/, '')
  const start = text.indexOf('{')
  if (start < 0) throw new Error('asar header does not contain JSON')
  return { header: JSON.parse(text.slice(start)), base: 16 + headerSize }
}

/**
 * Walk the header tree to one entry.
 * @param {any} header - parsed archive header.
 * @param {string} entryPath - slash-separated path inside the archive.
 * @returns {any} the entry node, or null when absent.
 */
export function findAsarEntry(header, entryPath) {
  const segments = entryPath.replaceAll('\\', '/').split('/').filter((segment) => segment !== '')
  let node = header
  for (const segment of segments) {
    node = node?.files?.[segment]
    if (node === undefined || node === null) return null
  }
  return node.files === undefined ? node : null
}

/**
 * Read one file out of an archive.
 * @param {string} asarPath - archive path.
 * @param {string} entryPath - slash-separated path inside the archive.
 * @returns {Buffer} file bytes.
 */
export function readAsarFile(asarPath, entryPath) {
  const fd = openSync(asarPath, 'r')
  try {
    const { header, base } = readAsarHeader(fd)
    const entry = findAsarEntry(header, entryPath)
    if (entry === null) throw new Error(`asar entry not found: ${entryPath}`)
    if (entry.unpacked === true) throw new Error(`asar entry is unpacked, not in the archive: ${entryPath}`)
    const size = Number(entry.size)
    const buffer = Buffer.alloc(size)
    if (readSync(fd, buffer, 0, size, base + Number(entry.offset)) !== size) {
      throw new Error(`asar entry is truncated: ${entryPath}`)
    }
    return buffer
  } finally {
    closeSync(fd)
  }
}

/**
 * Rewrite one archive entry in place.
 *
 * The replacement must keep the exact byte length: the directory tree (and
 * every offset after this entry) stays untouched.
 *
 * @param {string} asarPath - archive path.
 * @param {string} entryPath - slash-separated path inside the archive.
 * @param {(original: Buffer) => Buffer} transform - produces the replacement bytes.
 * @returns {{ original: Buffer, next: Buffer }} both versions, for backups and reporting.
 */
export function replaceAsarFile(asarPath, entryPath, transform) {
  const fd = openSync(asarPath, 'r+')
  try {
    const { header, base } = readAsarHeader(fd)
    const entry = findAsarEntry(header, entryPath)
    if (entry === null) throw new Error(`asar entry not found: ${entryPath}`)
    if (entry.unpacked === true) throw new Error(`asar entry is unpacked, not in the archive: ${entryPath}`)
    const size = Number(entry.size)
    const original = Buffer.alloc(size)
    if (readSync(fd, original, 0, size, base + Number(entry.offset)) !== size) {
      throw new Error(`asar entry is truncated: ${entryPath}`)
    }
    const next = transform(Buffer.from(original))
    if (next.length !== size) {
      throw new Error(`replacement for ${entryPath} changed the byte length (${size} -> ${next.length}); refusing to corrupt the archive`)
    }
    writeSync(fd, next, 0, next.length, base + Number(entry.offset))
    return { original, next }
  } finally {
    closeSync(fd)
  }
}
