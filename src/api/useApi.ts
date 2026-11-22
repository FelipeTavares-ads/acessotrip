import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | undefined
  error: unknown
  loading: boolean
  reload: () => void
  /** Substitui o dado localmente (após uma mutação que já devolveu o valor novo). */
  setData: (d: T | ((old: T | undefined) => T)) => void
}

/** Carrega dados da API e refaz a chamada quando `deps` mudam. `fn` nulo = não carregar. */
export function useApi<T>(fn: (() => Promise<T>) | null, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(!!fn)
  const [tick, setTick] = useState(0)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    const f = fnRef.current
    if (!f) {
      setLoading(false)
      return
    }
    let vivo = true
    setLoading(true)
    setError(undefined)
    f().then(
      (d) => vivo && (setData(d), setLoading(false)),
      (e) => vivo && (setError(e), setLoading(false)),
    )
    return () => {
      vivo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, loading, reload, setData: setData as AsyncState<T>['setData'] }
}
