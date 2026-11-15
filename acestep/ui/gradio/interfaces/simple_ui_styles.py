"""Compact, responsive stylesheet for the opt-in five-step Gradio flow.

The advanced interface retains its original styling and component hierarchy.
"""

SIMPLE_UI_CSS = """
#simple-ui-column {
    width: min(100%, 920px);
    margin: 0 auto;
    padding: 1rem clamp(0.5rem, 3vw, 2rem) 2rem;
    border-radius: 1rem;
    background: var(--background-fill-primary);
}
#simple-ui-column .simple-header {
    text-align: center;
    margin: 0 auto 1.5rem;
    padding: 1.25rem;
    border-radius: 0.8rem;
    background: linear-gradient(135deg, #31346c, #5d56a6);
    color: #fff;
}
#simple-ui-column .simple-header h2,
#simple-ui-column .simple-header p { color: #fff; }
#simple-ui-column .simple-header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
}
#simple-ui-column .simple-header-icon svg { width: 2.5rem; height: 2.5rem; }
#simple-ui-column .simple-step { display: contents; }
#simple-ui-column .simple-step-indicator { margin: 0 auto 1.5rem; }
#simple-ui-column .simple-nav-row,
#simple-ui-column .simple-footer-row {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
}
#simple-ui-column .simple-results-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 1rem !important;
}
#simple-ui-column .simple-result-col {
    min-width: 0;
    padding: 1rem;
    border: 1px solid var(--border-color-primary);
    border-radius: 0.8rem;
}
#simple-ui-column .simple-result-col audio,
#simple-ui-column .simple-result-col .wrap { max-width: 100%; }
#simple-ui-column .simple-result-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--body-text-color);
    margin-bottom: 0.5rem;
}
#simple-ui-column .simple-meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}
#simple-ui-column .simple-progress-track {
    border-radius: 10px;
    height: 8px;
    margin: 1rem auto;
    overflow: hidden;
    background: var(--background-fill-secondary);
}
#simple-ui-column .simple-progress-bar {
    height: 100%;
    width: 50%;
    background: #6f63ce;
}
#simple-ui-column .simple-gen-status {
    border-inline-start: 4px solid #7a72c0;
    padding: 0.75rem;
    overflow-wrap: anywhere;
}
#simple-ui-column .simple-gen-status.success { border-color: #32834c; }
#simple-ui-column .simple-hamburger-menu,
#simple-ui-column .simple-about-modal {
    border: 1px solid var(--border-color-primary);
    border-radius: 0.8rem;
    padding: 1rem;
}
#simple-ui-column :is(button, input, textarea, select):focus-visible {
    outline: 3px solid #7164c8 !important;
    outline-offset: 2px;
}
@media (max-width: 680px) {
    #simple-ui-column { padding: 0.5rem; }
    #simple-ui-column .simple-results-row {
        grid-template-columns: minmax(0, 1fr) !important;
    }
    #simple-ui-column .simple-header-content { flex-direction: column; gap: 0.5rem; }
    #simple-ui-column .simple-nav-row button { flex: 1 1 10rem; }
}
@media (prefers-reduced-motion: reduce) {
    #simple-ui-column * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
"""