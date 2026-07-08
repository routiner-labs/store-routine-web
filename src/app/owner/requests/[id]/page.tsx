'use client'

import { use } from 'react'
import RequestDetailView from '../RequestDetailView'

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <RequestDetailView id={id} mode="page" />
}
