"""5-step simplified UI component builder with SVG icons and hamburger menu."""

_STEP_LABELS = ["Describe Song", "Lyrics", "Remix", "Creating", "Done"]


def _step_indicator_html(current: int) -> str:
    """Generate inline SVG step indicator with connected dots and labels."""
    total = len(_STEP_LABELS)
    spacing = 120
    padding = 40
    width = padding * 2 + (total - 1) * spacing
    height = 70

    circles = []
    lines = []
    for i in range(total):
        cx = padding + i * spacing
        if i < current - 1:
            circles.append(
                f'<circle cx="{cx}" cy="28" r="9" fill="#667eea" stroke="none"/>'
                f'<path d="M{cx - 4} 28l{3} {3}l{6} -{6}" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            )
        elif i == current - 1:
            circles.append(
                f'<circle cx="{cx}" cy="28" r="11" fill="#667eea" stroke="white" stroke-width="3" filter="url(#glow)"/>'
            )
        else:
            circles.append(
                f'<circle cx="{cx}" cy="28" r="9" fill="none" stroke="#d0d0d0" stroke-width="2"/>'
            )
        color = "#667eea" if i <= current - 1 else "#999"
        weight = "600" if i == current - 1 else "400"
        circles.append(
            f'<text x="{cx}" y="56" text-anchor="middle" font-size="11" font-weight="{weight}" fill="{color}">{_STEP_LABELS[i]}</text>'
        )

    for i in range(total - 1):
        x1 = padding + i * spacing + 9
        x2 = padding + (i + 1) * spacing - 9
        stroke = "#667eea" if i < current - 1 else "#e0e0e0"
        lines.append(f'<line x1="{x1}" y1="28" x2="{x2}" y2="28" stroke="{stroke}" stroke-width="2"/>')

    glow = (
        '<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%">'
        '<feGaussianBlur stdDeviation="3" result="blur"/>'
        '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>'
        '</filter></defs>'
    )

    return f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" style="display:block;margin:0 auto;max-width:100%">{glow}{"".join(lines)}{"".join(circles)}</svg>'


def _build_header() -> str:
    """Return compact header HTML with hamburger icon."""
    return f'''
    <div class="simple-header">
        <div class="simple-header-content">
            <div class="simple-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="30" height="30">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
            </div>
            <div class="simple-header-text">
                <h2>Quick Music Generator</h2>
                <p>Turn your ideas into music in seconds</p>
            </div>
        </div>
    </div>
    '''


def _about_overlay_html() -> str:
    """Return the About modal content."""
    return f'''
    <div class="simple-about-icon">🎛️</div>
    <h2>ACE-Step V1.5 Playground 💡</h2>
    <p class="simple-about-subtitle">Pushing the Boundaries of Open-Source Music Generation</p>
    <p class="simple-about-desc">
        Generate high-quality music from text descriptions, remix existing tracks,
        and explore the future of AI-powered music creation.
    </p>
    '''


