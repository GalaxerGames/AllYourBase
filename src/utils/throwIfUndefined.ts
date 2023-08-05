export default function throwIfUndefined(
  input: string | undefined,
  errorMessage: string
) {
  if (!input) {
    throw new Error(errorMessage)
  }

  return input
}
