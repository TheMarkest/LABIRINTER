import type { InstructionSection } from '../content/instructions';

interface UsageDialogProps {
  sections: InstructionSection[];
  onClose: () => void;
}

export function UsageDialog({ sections, onClose }: UsageDialogProps) {
  return (
    <div className="usage-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="usage-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="How to use"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="usage-dialog__header">
          <div>
            <p className="usage-dialog__eyebrow">Quick Guide</p>
            <h2>{'How to use / \u0418\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f'}</h2>
          </div>
          <button type="button" className="usage-dialog__close" onClick={onClose} aria-label="Close instructions">
            Close
          </button>
        </div>

        <div className="usage-dialog__grid">
          {sections.map((section) => (
            <section key={section.language} className="usage-dialog__section">
              <h3>{section.title}</h3>
              <div className="usage-dialog__lines">
                {section.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
