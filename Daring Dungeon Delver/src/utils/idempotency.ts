export function uuidv4(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    if (typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      const byteToHex: string[] = [];
      for (let i = 0; i < 256; i += 1) {
        byteToHex.push((i + 0x100).toString(16).substring(1));
      }

      return (
        byteToHex[bytes[0]] +
        byteToHex[bytes[1]] +
        byteToHex[bytes[2]] +
        byteToHex[bytes[3]] +
        "-" +
        byteToHex[bytes[4]] +
        byteToHex[bytes[5]] +
        "-" +
        byteToHex[bytes[6]] +
        byteToHex[bytes[7]] +
        "-" +
        byteToHex[bytes[8]] +
        byteToHex[bytes[9]] +
        "-" +
        byteToHex[bytes[10]] +
        byteToHex[bytes[11]] +
        byteToHex[bytes[12]] +
        byteToHex[bytes[13]] +
        byteToHex[bytes[14]] +
        byteToHex[bytes[15]]
      );
    }
  }

  // Fallback using Math.random (lower entropy, but keeps format)
  let timestamp = new Date().getTime();
  let performanceNow = 0;
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    performanceNow = Math.floor(performance.now() * 1000);
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor((timestamp + performanceNow + Math.random() * 16) % 16);
    timestamp = Math.floor(timestamp / 16);
    performanceNow = Math.floor(performanceNow / 16);

    if (char === "x") {
      return random.toString(16);
    }
    return ((random & 0x3) | 0x8).toString(16);
  });
}

