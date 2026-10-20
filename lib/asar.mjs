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
import { createRequire } from 'node:module'

/**
 * Descriptors opened inside the desktop shell.
 *
 * Electron installs an `asar` layer over `node:fs` that reads any `*.asar` path
 * as `<archive>/<entry>`, so opening the archive itself fails there with
 * `ENOENT,  not found in …app.asar`. `original-fs` is Electron's unwrapped
 * filesystem, which is exactly what an in-place archive rewrite needs.
 * @returns {typeof import('node:fs')} the filesystem to use.
 */
function filesystem() {
  if (process.versions.electron === undefined) return { openSync, readSync, writeSync, closeSync }
  try {
    const original = createRequire(import.meta.url)('original-fs')
    return { openSync: original.openSync, readSync: original.readSync, writeSync: original.writeSync, closeSync: original.closeSync }
  } catch {
    return { openSync, readSync, writeSync, closeSync }
  }
}

const fs = filesystem()

/**
 * Read and parse the archive header.
 * @param {number} fd - open file descriptor.
 * @returns {{ header: any, base: number }} the directory tree and the offset where file bytes start.
 */
export function readAsarHeader(fd) {
  const head = Buffer.alloc(16)
  if (fs.readSync(fd, head, 0, 16, 0) !== 16) throw new Error('asar header is truncated')
  const headerSize = head.readUInt32LE(12)
  if (headerSize === 0 || headerSize > 64 * 1024 * 1024) throw new Error('asar header size is implausible')
  const raw = Buffer.alloc(headerSize)
  if (fs.readSync(fd, raw, 0, headerSize, 16) !== headerSize) throw new Error('asar header is truncated')
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
  const fd = fs.openSync(asarPath, 'r')
  try {
    const { header, base } = readAsarHeader(fd)
    const entry = findAsarEntry(header, entryPath)
    if (entry === null) throw new Error(`asar entry not found: ${entryPath}`)
    if (entry.unpacked === true) throw new Error(`asar entry is unpacked, not in the archive: ${entryPath}`)
    const size = Number(entry.size)
    const buffer = Buffer.alloc(size)
    if (fs.readSync(fd, buffer, 0, size, base + Number(entry.offset)) !== size) {
      throw new Error(`asar entry is truncated: ${entryPath}`)
    }
    return buffer
  } finally {
    fs.closeSync(fd)
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
  const fd = fs.openSync(asarPath, 'r+')
  try {
    const { header, base } = readAsarHeader(fd)
    const entry = findAsarEntry(header, entryPath)
    if (entry === null) throw new Error(`asar entry not found: ${entryPath}`)
    if (entry.unpacked === true) throw new Error(`asar entry is unpacked, not in the archive: ${entryPath}`)
    const size = Number(entry.size)
    const original = Buffer.alloc(size)
    if (fs.readSync(fd, original, 0, size, base + Number(entry.offset)) !== size) {
      throw new Error(`asar entry is truncated: ${entryPath}`)
    }
    const next = transform(Buffer.from(original))
    if (next.length !== size) {
      throw new Error(`replacement for ${entryPath} changed the byte length (${size} -> ${next.length}); refusing to corrupt the archive`)
    }
    fs.writeSync(fd, next, 0, next.length, base + Number(entry.offset))
    return { original, next }
  } finally {
    fs.closeSync(fd)
  }
}
