import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Guidelines } from './parts';

const CORE_SWATCHES = [
  { name: 'Primary', className: 'bg-primary' },
  { name: 'Secondary', className: 'bg-secondary' },
  { name: 'Accent', className: 'bg-accent' },
] as const;

const SUPPORTING_SWATCHES = [
  { name: 'Background', className: 'border bg-background' },
  { name: 'Foreground', className: 'bg-foreground' },
  { name: 'Muted', className: 'bg-muted' },
  { name: 'Destructive', className: 'bg-destructive' },
  { name: 'Border', className: 'bg-border' },
] as const;

const TYPE_SCALE = [
  { label: 'Display', className: 'text-4xl font-bold' },
  { label: 'Heading', className: 'text-2xl font-semibold' },
  { label: 'Body', className: 'text-base' },
  { label: 'Label', className: 'text-sm font-medium' },
  { label: 'Caption', className: 'text-sm text-muted-foreground' },
] as const;

const SPACING_SCALE = [
  { label: '4', className: 'w-4' },
  { label: '8', className: 'w-8' },
  { label: '12', className: 'w-12' },
  { label: '16', className: 'w-16' },
  { label: '24', className: 'w-24' },
] as const;

function Swatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-lg ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Core palette
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Keyboard preview
              </h2>
              <p className="mt-3 text-2xl font-semibold">සිංහල ටයිප් කරන්න</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sinhala first, with English always close.
              </p>
            </div>
            <Badge variant="secondary">SI · EN</Badge>
          </div>
          <div className="mt-5 rounded-xl border bg-muted/60 p-3">
            <div className="mb-3 flex justify-center gap-2 text-sm text-muted-foreground">
              <span>කොහොමද</span>
              <span className="text-primary">සිංහල</span>
              <span>කියන්න</span>
            </div>
            {[
              ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
              ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
              ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
            ].map((row, rowIndex) => (
              <div key={rowIndex} className="mb-1.5 flex justify-center gap-1.5">
                {row.map((key) => (
                  <span
                    key={key}
                    className={`flex h-9 min-w-7 flex-1 items-center justify-center rounded-md border bg-card text-sm shadow-sm ${
                      key === '⇧' || key === '⌫'
                        ? 'max-w-12 bg-secondary text-secondary-foreground'
                        : 'text-card-foreground'
                    }`}
                  >
                    {key}
                  </span>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-1.5">
              <span className="flex h-9 min-w-12 items-center justify-center rounded-md border bg-secondary px-3 text-xs text-secondary-foreground">
                සිං
              </span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-md border bg-card text-xs text-card-foreground shadow-sm">
                English · Sinhala
              </span>
              <span className="flex h-9 min-w-12 items-center justify-center rounded-md border bg-primary px-3 text-xs text-primary-foreground">
                ↵
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Type and controls
          </h2>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Smart suggestions</CardTitle>
              <CardDescription>
                Suggestions stay readable in both languages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="overview-name">Try a Sinhala phrase</Label>
                <Input id="overview-name" value="sinhala → සිංහල" readOnly />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="overview-suggestions" />
                <Label htmlFor="overview-suggestions">Word suggestions</Label>
                <Badge className="ml-auto">On-device</Badge>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>Apply</Button>
              <Button variant="outline">Preview</Button>
            </CardFooter>
          </Card>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Source-derived layout guidance
        </h2>
        <Guidelines
          items={[
            {
              kind: 'do',
              text: 'Keep Singlish transliteration and the Wijesekara physical layout as separate typing modes.',
            },
            {
              kind: 'do',
              text: 'Reserve screen-edge positions for less critical keys; phone cases can make them harder to reach.',
            },
            {
              kind: 'do',
              text: 'Use directional swipes for secondary characters so common letters stay easy to tap.',
            },
            {
              kind: 'dont',
              text: 'Do not combine phonetic transliteration rules with physical key-position mappings.',
            },
          ]}
        />
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Brand colors</h2>
          <p className="text-sm text-muted-foreground">
            The core roles used for emphasis, supporting actions, and accents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Semantic and surface colors</h2>
          <p className="text-sm text-muted-foreground">
            Roles for text, backgrounds, borders, muted content, and danger.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SUPPORTING_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function FontsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Font family
        </h2>
        <p className="mt-4 text-4xl font-bold">The quick brown fox</p>
        <p className="mt-3 text-3xl font-medium">සිංහල භාෂාව</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Inter covers Latin UI text; Noto Sans Sinhala supplies clear Sinhala glyphs.
        </p>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Type scale
        </h2>
        {TYPE_SCALE.map((entry) => (
          <div key={entry.label} className="grid gap-2 sm:grid-cols-[88px_1fr]">
            <span className="pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {entry.label}
            </span>
            <p className={entry.className}>Build products people understand.</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function LayoutPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Spacing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The spacing scale, derived from the base spacing token.
        </p>
        <div className="mt-6 space-y-4">
          {SPACING_SCALE.map((space) => (
            <div key={space.label} className="flex items-center gap-4">
              <span className="w-8 text-xs text-muted-foreground">
                {space.label}
              </span>
              <div className={`h-3 rounded-full bg-primary ${space.className}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Radius</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Corner treatments derive from the base radius token.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { label: 'Small', className: 'rounded-sm' },
            { label: 'Medium', className: 'rounded-md' },
            { label: 'Large', className: 'rounded-lg' },
            { label: 'Extra large', className: 'rounded-xl' },
          ].map((radius) => (
            <div
              key={radius.label}
              className={`flex h-24 items-end border bg-muted p-3 ${radius.className}`}
            >
              <span className="text-xs font-medium">{radius.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-card p-6 text-card-foreground lg:col-span-2">
        <h2 className="font-semibold">Keyboard composition</h2>
        <div className="mt-4">
          <Guidelines
            items={[
              {
                kind: 'do',
                text: 'Keep high-frequency letters and punctuation away from difficult screen edges.',
              },
              {
                kind: 'do',
                text: 'Place secondary symbols on directional gestures instead of crowding the main key layer.',
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
