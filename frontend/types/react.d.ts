// Type definitions for React (temporary until npm install)
declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void
  export function useRef<T>(initialValue: T | null): { current: T | null }
  export function useRef<T = undefined>(): { current: T | undefined }
  export default any
}





