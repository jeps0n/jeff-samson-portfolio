import { categories, type CategoryId } from './data'

export type IconBorderMode = 'none' | 'box' | 'shape'

export interface IconBorder {
  mode: IconBorderMode
  color: string
  width: number
  opacity: number
}

export interface Project {
  id: string
  title: string
  category: CategoryId
  order: number
  description: string
  tags: string[]
  url?: string
  cover?: string
  icon?: string
  iconBorder: IconBorder
}

interface ProjectMetadata {
  title?: unknown
  category?: unknown
  order?: unknown
  description?: unknown
  tags?: unknown
  url?: unknown
  iconBorder?: unknown
}

const metadata = import.meta.glob<ProjectMetadata>(
  './projects/*/project.json',
  {
    eager: true,
    import: 'default',
  },
)

const covers = import.meta.glob<string>(
  './projects/*/cover.webp',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const svgFavicons = import.meta.glob<string>(
  './projects/*/favicon.svg',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const pngFavicons = import.meta.glob<string>(
  './projects/*/favicon.png',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const categoryIds = new Set<string>(categories.map(category => category.id))

function optionalUrl(
  value: unknown,
  field: string,
  path: string,
): string | undefined {
  if (value === undefined || value === '') {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new Error(`${path}: ${field} must be a URL string`)
  }

  try {
    const url = new URL(value)

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('Unsupported URL protocol')
    }

    return url.href
  } catch {
    throw new Error(`${path}: ${field} must be a valid HTTP(S) URL`)
  }
}

const defaultIconBorderColor = '#DCE6F0'

function parseIconBorder(value: unknown, path: string): IconBorder {
  const defaults: IconBorder = {
    mode: 'none',
    color: defaultIconBorderColor,
    width: 1,
    opacity: 0.22,
  }

  if (value === undefined) {
    return defaults
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path}: iconBorder must be an object`)
  }

  const border = value as Record<string, unknown>
  const mode = border.mode ?? defaults.mode
  const color = border.color ?? defaults.color
  const width = border.width ?? defaults.width
  const opacity = border.opacity ?? defaults.opacity

  if (mode !== 'none' && mode !== 'box' && mode !== 'shape') {
    throw new Error(`${path}: iconBorder.mode must be none, box, or shape`)
  }

  if (
    typeof color !== 'string' ||
    !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)
  ) {
    throw new Error(`${path}: iconBorder.color must be a 3- or 6-digit hex color`)
  }

  if (
    typeof width !== 'number' ||
    !Number.isFinite(width) ||
    width < 0
  ) {
    throw new Error(`${path}: iconBorder.width must be a non-negative number`)
  }

  if (
    typeof opacity !== 'number' ||
    !Number.isFinite(opacity) ||
    opacity < 0 ||
    opacity > 1
  ) {
    throw new Error(`${path}: iconBorder.opacity must be between 0 and 1`)
  }

  return {
    mode,
    color,
    width,
    opacity,
  }
}

function loadProject(path: string, data: ProjectMetadata): Project {
  const id = path.split('/').at(-2) ?? ''
  const assetPath = path.slice(0, -'project.json'.length)

  if (typeof data.title !== 'string' || !data.title.trim()) {
    throw new Error(`${path}: title is required`)
  }

  if (typeof data.category !== 'string' || !categoryIds.has(data.category)) {
    throw new Error(`${path}: unknown category`)
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new Error(`${path}: description must be a string`)
  }

  if (
    data.order !== undefined &&
    (typeof data.order !== 'number' || !Number.isFinite(data.order))
  ) {
    throw new Error(`${path}: order must be a finite number`)
  }

  if (
    data.tags !== undefined &&
    (!Array.isArray(data.tags) ||
      data.tags.length > 6 ||
      !data.tags.every(tag => typeof tag === 'string' && tag.trim()))
  ) {
    throw new Error(`${path}: tags must contain at most six nonempty strings`)
  }

  return {
    id,
    title: data.title,
    category: data.category as CategoryId,
    order: (data.order as number | undefined) ?? 0,
    description: (data.description as string | undefined) ?? '',
    tags: (data.tags as string[] | undefined) ?? [],
    url: optionalUrl(data.url, 'url', path),
    cover: covers[`${assetPath}cover.webp`],
    icon:
      svgFavicons[`${assetPath}favicon.svg`] ??
      pngFavicons[`${assetPath}favicon.png`],
    iconBorder: parseIconBorder(data.iconBorder, path),
  }
}

export const projects: Project[] = Object.entries(metadata).map(
  ([path, data]) => loadProject(path, data),
)

export function projectsIn(category: CategoryId): Project[] {
  const matching = projects
    .filter(project => project.category === category)
    .sort(
      (first, second) =>
        first.order - second.order ||
        first.title.localeCompare(second.title),
    )

  return matching.slice(0, 3)
}
