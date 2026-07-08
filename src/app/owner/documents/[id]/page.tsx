'use client'

import { use } from 'react'
import DocumentDetailView from '../DocumentDetailView'

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <DocumentDetailView id={id} mode="page" />
}
