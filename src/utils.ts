export const noop = (): void => {}

export const sleep = async (ms: number): Promise<unknown> =>
  await new Promise((resolve) => setTimeout(resolve, ms))

export const arrayDiff = <T>(a: T[] = [], b: T[] = []): T[] => {
  return [
    ...a.filter((x) => !b.includes(x)),
    ...b.filter((x) => !a.includes(x))
  ]
}

interface ChainedWhen<T, R> {
  when: <A>(pred: (v: T) => boolean, fn: () => A) => ChainedWhen<T, R | A>
  otherwise: <A>(fn: () => A) => R | A
}

const match = <T, R>(val: any): ChainedWhen<T, R> => ({
  when: <A>(_pred: (v: T) => boolean, _fn: () => A) => match<T, R | A>(val),
  otherwise: <A>(_fn: () => A): A | R => val
})

const chain = <T, R>(val: T): ChainedWhen<T, R> => ({
  when: <A>(pred: (v: T) => boolean, fn: () => A) =>
    pred(val) ? match(fn()) : chain<T, A | R>(val),
  otherwise: <A>(fn: () => A) => fn()
})

export const _case = <T>(val: T): {
  when: <A>(pred: (v: T) => boolean, fn: () => A) => ChainedWhen<T, A>
} => ({
    when: <A>(pred: (v: T) => boolean, fn: () => A) =>
      pred(val) ? match<T, A>(fn()) : chain<T, A>(val)
  })

export const eq =
  <T>(val1: T) =>
    (val2: T) =>
      val1 === val2
