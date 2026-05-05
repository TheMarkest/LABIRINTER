interface AppHeaderProps {
  schemeTitle: string;
  onOpenInstructions: () => void;
}

export function AppHeader({ schemeTitle, onOpenInstructions }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__topline">
        <p className="app-header__eyebrow">Fabric Maze Planning Console</p>
        <button type="button" className="app-header__help-button" onClick={onOpenInstructions}>
          {'How to use / \u0418\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f'}
        </button>
      </div>
      <h1>LABIRINTER</h1>
      <p className="app-header__scheme-title">{schemeTitle || 'Untitled scheme'}</p>
      <p className="app-header__lede">
        Configure the rope grid, light up wall segments, and keep fabric takeoff tied to the exact maze
        plan and perimeter treatment.
      </p>
    </header>
  );
}
