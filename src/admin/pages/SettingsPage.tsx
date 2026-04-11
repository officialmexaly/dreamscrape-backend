'use client'

import * as React from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings } from '../providers/SettingsProvider'
import { useToast } from '@/src/admin/toast/ToastProvider'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}

export function SettingsPage() {
  const { settings, saveSettings, isLoading } = useSettings()
  const [draft, setDraft] = React.useState<any>(settings)
  const { toast } = useToast()

  React.useEffect(() => {
    setDraft(settings)
  }, [settings])

  const handleSave = async () => {
    try {
      await saveSettings(draft)
      toast({ title: 'Settings updated', variant: 'success', duration: 2000 })
    } catch (error: any) {
      toast({
        title: error?.message || 'Failed to save settings',
        variant: 'error',
        duration: 2500,
      })
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-serif text-2xl font-semibold text-foreground">
            Global Settings
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Company details, social links, and defaults.
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading || !draft}>
          <Save size={16} />
          Save Settings
        </Button>
      </div>

      {isLoading || !draft ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-serif text-lg">
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Company Name">
                <Input
                  value={draft.companyName || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, companyName: e.target.value })
                  }
                  className="h-10"
                />
              </Field>
              <Field label="Contact Email">
                <Input
                  type="email"
                  value={draft.email || ''}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  className="h-10"
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={draft.phone || ''}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  className="h-10"
                />
              </Field>
              <Field label="Physical Address">
                <Input
                  value={draft.address || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, address: e.target.value })
                  }
                  className="h-10"
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Social Media</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Instagram Handle">
                <Input
                  value={draft.instagram || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, instagram: e.target.value })
                  }
                  className="h-10"
                />
              </Field>
              <Field label="Facebook Page">
                <Input
                  value={draft.facebook || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, facebook: e.target.value })
                  }
                  className="h-10"
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-serif text-lg">SEO Defaults</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <Field label="Default Meta Title">
                <Input
                  value={draft.metaTitle || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, metaTitle: e.target.value })
                  }
                  className="h-10"
                />
              </Field>
              <Field label="Default Meta Description">
                <Input
                  value={draft.metaDescription || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, metaDescription: e.target.value })
                  }
                  className="h-10"
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

