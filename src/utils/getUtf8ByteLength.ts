export function getUtf8ByteLength(value: string): number {
  return encodeURIComponent(value).replace(/%[A-F\d]{2}|./gi, 'x').length
}