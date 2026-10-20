import './style.css'
import { categories } from './data'
import { projectsIn, type Project } from './project-loader'

const githubUrl = 'https://github.com/jeps0n'

type Category = (typeof categories)[number]

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return value.replace(
    /[&<>"']/g,
    character => entities[character],
  )
}

function projectScreenshot(project: Project): string {
  if (!project.cover) {
    return `
      <div
        class="preview-empty"
        aria-label="Screenshot not added yet"
      >
        <span class="preview-mark" aria-hidden="true">▣</span>
        <span>SCREENSHOT COMING SOON</span>
      </div>
    `
  }

  return `
    <button
      class="preview-trigger"
      type="button"
      aria-label="Enlarge screenshot of ${escapeHtml(project.title)}"
    >
      <img
        src="${escapeHtml(project.cover)}"
        alt="Screenshot of ${escapeHtml(project.title)}"
        loading="lazy"
      />
    </button>
  `
}

const iconSize = 44
const iconCornerRadius = 7

function projectIcon(project: Project): string {
  if (!project.icon) {
    return `
      <span
        class="project-icon project-icon--fallback"
        aria-hidden="true"
      >◇</span>
    `
  }

  const iconUrl = escapeHtml(project.icon)
  const { mode, color, width, opacity } = project.iconBorder

  if (mode === 'none' || width === 0 || opacity === 0) {
    return `
      <img
        class="project-icon"
        src="${iconUrl}"
        alt=""
        loading="lazy"
      />
    `
  }

  const image = `
    <image
      href="${iconUrl}"
      width="${iconSize}"
      height="${iconSize}"
      preserveAspectRatio="xMidYMid meet"
    />
  `

  const borderId = `icon-border-${project.id}`

  if (mode === 'box') {
    const halfWidth = width / 2
    const strokeSize = Math.max(0, iconSize - width)
    const strokeRadius = Math.max(0, iconCornerRadius - halfWidth)

    return `
      <svg
        class="project-icon"
        viewBox="0 0 ${iconSize} ${iconSize}"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id="${borderId}" clipPathUnits="userSpaceOnUse">
            <rect
              width="${iconSize}"
              height="${iconSize}"
              rx="${iconCornerRadius}"
            />
          </clipPath>
        </defs>
        <g clip-path="url(#${borderId})">
          ${image}
          <rect
            x="${halfWidth}"
            y="${halfWidth}"
            width="${strokeSize}"
            height="${strokeSize}"
            rx="${strokeRadius}"
            fill="none"
            stroke="${color}"
            stroke-width="${width}"
            stroke-opacity="${opacity}"
          />
        </g>
      </svg>
    `
  }

  return `
    <svg
      class="project-icon"
      viewBox="0 0 ${iconSize} ${iconSize}"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id="${borderId}"
          x="0"
          y="0"
          width="100%"
          height="100%"
          color-interpolation-filters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="erode"
            radius="${width}"
            result="innerAlpha"
          />
          <feComposite
            in="SourceAlpha"
            in2="innerAlpha"
            operator="out"
            result="borderAlpha"
          />
          <feFlood
            flood-color="${color}"
            flood-opacity="${opacity}"
            result="borderPaint"
          />
          <feComposite
            in="borderPaint"
            in2="borderAlpha"
            operator="in"
          />
        </filter>
      </defs>
      ${image}
      <g filter="url(#${borderId})">
        ${image}
      </g>
    </svg>
  `
}

function projectLaunch(project: Project): string {
  if (!project.url) {
    return `
      <span class="project-launch is-disabled" aria-disabled="true">
        <span class="project-launch-label">LAUNCH</span>
      </span>
    `
  }

  return `
    <a
      class="project-launch"
      href="${escapeHtml(project.url)}"
      target="_blank"
      rel="noopener noreferrer"
    ><span class="project-launch-label">LAUNCH</span></a>
  `
}

function projectCard(project: Project): string {
  const tags = project.tags
    .map(tag => `<span class="tech-tag">${escapeHtml(tag)}</span>`)
    .join('')

  return `
    <article class="project-card">
      <div class="preview-area">
        <div class="preview-frame">
          ${projectScreenshot(project)}
        </div>
      </div>

      <div class="project-info">
        <div class="project-details">
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.description)}</p>
          <div class="tech-tags">${tags}</div>
        </div>

        <div class="project-actions">
          ${projectIcon(project)}
          ${projectLaunch(project)}
        </div>
      </div>
    </article>
  `
}

function categorySection(category: Category): string {
  const cards = projectsIn(category.id)
    .map(projectCard)
    .join('')

  const projectContent = cards
    ? `<div class="project-grid">${cards}</div>`
    : `
      <p class="empty-category">
        Projects will appear here as they are added.
      </p>
    `

  return `
    <section
      class="category-row theme-${category.theme}"
      id="${category.id}"
      aria-labelledby="${category.id}-title"
    >
      <div class="category-banner">
        <div class="banner-copy">
          <h2 id="${category.id}-title">${category.name}</h2>
          <p>${category.description}</p>
        </div>

        <span class="banner-emblem" aria-hidden="true">
          ${category.symbol}
        </span>
      </div>

      <div class="project-area">
        ${projectContent}
      </div>
    </section>
  `
}

function categoryNavigation(): string {
  return categories
    .map(category => `
      <a href="#${category.id}">${category.name}</a>
    `)
    .join('')
}

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app element')
}

app.innerHTML = `
  <div class="site-shell" id="top">
    <header class="site-header">
      <div class="site-identity">
        <h1>JEFF SAMSON</h1>
        <p>SOFTWARE ENGINEER</p>
      </div>

      <nav class="main-nav" aria-label="Portfolio categories">
        ${categoryNavigation()}
      </nav>

      <a
        class="header-github"
        href="${githubUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          class="github-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.75-1.31-3.75-1.31-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1.01 1.72 2.65 1.22 3.3.93.1-.73.4-1.22.72-1.5-2.47-.28-5.07-1.24-5.07-5.49 0-1.21.43-2.2 1.15-2.98-.12-.28-.5-1.41.11-2.94 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.43 3.04-1.14 3.04-1.14.61 1.53.23 2.66.12 2.94.72.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.21-5.08 5.48.41.36.77 1.05.77 2.12v3.14c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/>
        </svg>
        <span>GitHub</span>
      </a>
    </header>

    <main class="category-list">
      ${categories.map(categorySection).join('')}
    </main>

    <footer class="site-footer">
      <div class="footer-signature">
        <p class="footer-tagline">Engineering meets imagination.</p>
        <p class="footer-copyright">
          © ${new Date().getFullYear()} Jeff Samson
        </p>
      </div>

      <div class="footer-links">
        <a
          href="${githubUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</a>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  </div>

  <dialog class="screenshot-dialog" aria-label="Expanded project screenshot">
    <button
      class="screenshot-dialog-close"
      type="button"
      aria-label="Close screenshot preview"
    >×</button>
    <img class="screenshot-dialog-image" alt="" />
  </dialog>
`

function enablePointerIllumination(
  selector: string,
  xProperty: string,
  yProperty: string,
): void {
  const elements = document.querySelectorAll<HTMLElement>(selector)

  for (const element of elements) {
    element.addEventListener('pointermove', event => {
      const bounds = element.getBoundingClientRect()

      element.style.setProperty(
        xProperty,
        `${event.clientX - bounds.left}px`,
      )
      element.style.setProperty(
        yProperty,
        `${event.clientY - bounds.top}px`,
      )
    })
  }
}

enablePointerIllumination(
  '.project-card',
  '--pointer-x',
  '--pointer-y',
)

enablePointerIllumination(
  '.project-launch',
  '--launch-pointer-x',
  '--launch-pointer-y',
)

function enableScreenshotPreview(): void {
  const dialog = document.querySelector<HTMLDialogElement>(
    '.screenshot-dialog',
  )
  const image = dialog?.querySelector<HTMLImageElement>(
    '.screenshot-dialog-image',
  )
  const closeButton = dialog?.querySelector<HTMLButtonElement>(
    '.screenshot-dialog-close',
  )

  if (!dialog || !image || !closeButton) {
    return
  }

  const triggers = document.querySelectorAll<HTMLButtonElement>(
    '.preview-trigger',
  )

  for (const trigger of triggers) {
    trigger.addEventListener('click', () => {
      const screenshot = trigger.querySelector('img')

      if (!screenshot) {
        return
      }

      image.src = screenshot.currentSrc || screenshot.src
      image.alt = screenshot.alt
      dialog.showModal()
    })
  }

  closeButton.addEventListener('click', () => {
    dialog.close()
  })

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.close()
    }
  })

  dialog.addEventListener('close', () => {
    image.removeAttribute('src')
    image.alt = ''
  })
}

enableScreenshotPreview()
