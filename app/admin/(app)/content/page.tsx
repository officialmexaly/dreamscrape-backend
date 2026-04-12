'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Home,
  User,
  Briefcase,
  Mail,
  Settings,
  ChevronRight,
  Heart,
  Calendar,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { cn } from '@/src/lib/utils'

const pages = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    description: 'Hero slides, brand intro, statistics, services preview',
    tone: 'violet',
  },
  {
    id: 'about',
    label: 'About',
    icon: User,
    description: 'Story, philosophy, team information',
    tone: 'sky',
  },
  {
    id: 'services',
    label: 'Services',
    icon: Briefcase,
    description: 'Services page content and introduction',
    tone: 'emerald',
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Mail,
    description: 'Contact information and forms',
    tone: 'amber',
  },
  {
    id: 'love_notes',
    label: 'Love Notes',
    icon: Heart,
    description: 'Client testimonials and reviews',
    tone: 'rose',
  },
  {
    id: 'consultation',
    label: 'Consultation',
    icon: Calendar,
    description: 'Consultation booking configuration',
    tone: 'teal',
  },
  {
    id: 'consultation_editorial',
    label: 'Consultation Editorial',
    icon: FileText,
    description: 'Consultation options and editorial content',
    tone: 'cyan',
  },
] as const

function toneClasses(tone: string) {
  switch (tone) {
    case 'violet':
      return 'bg-violet-50 text-violet-700 ring-violet-200'
    case 'sky':
      return 'bg-sky-50 text-sky-700 ring-sky-200'
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'amber':
      return 'bg-amber-50 text-amber-800 ring-amber-200'
    case 'rose':
      return 'bg-rose-50 text-rose-700 ring-rose-200'
    case 'teal':
      return 'bg-teal-50 text-teal-700 ring-teal-200'
    case 'cyan':
      return 'bg-cyan-50 text-cyan-700 ring-cyan-200'
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200'
  }
}

export default function ContentRoute() {
  const router = useRouter()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
          Site Content
        </div>
        <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Edit website content in structured sections.
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => {
          const Icon = page.icon
          return (
            <Card
              key={page.id}
              className="cursor-pointer border-border/70 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_50px_rgba(64,21,63,0.08)]"
              onClick={() => router.push(`/admin/content/${page.id}`)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      'grid h-10 w-10 sm:h-11 sm:w-11 place-items-center flex-shrink-0 rounded-xl ring-1 ring-inset',
                      toneClasses(page.tone)
                    )}
                  >
                    <Icon size={16} className="sm:size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="truncate text-sm sm:text-base font-semibold text-foreground">
                        {page.label} Page
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 sm:size-[18px]" />
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {page.description}
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold ring-1 ring-inset',
                          toneClasses(page.tone)
                        )}
                      >
                        Easy editor
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <Card
          className="cursor-pointer border-dashed border-border/70 transition hover:-translate-y-0.5 hover:bg-muted/20"
          onClick={() => router.push('/admin/content/advanced')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center flex-shrink-0 rounded-xl bg-muted text-muted-foreground ring-1 ring-inset ring-border">
                <Settings size={16} className="sm:size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="truncate text-sm sm:text-base font-semibold text-foreground">
                    Advanced View
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 sm:size-[18px]" />
                </div>
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  Table-based editing for all content items.
                </div>
                <div className="mt-2 sm:mt-3">
                  <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                    For advanced users
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

