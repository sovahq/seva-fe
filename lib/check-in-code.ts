const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** Generates a 6-character alphanumeric check-in code (no ambiguous 0/O, 1/I). */
export function generateCheckInCode(): string {
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)]
  }
  return code
}
