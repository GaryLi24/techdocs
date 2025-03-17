import type { Metadata } from 'next'

declare module 'next' {
  export type PageProps<Params = {}> = {
    params: Params
    searchParams?: { [key: string]: string | string[] | undefined }
  }
}
