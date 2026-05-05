interface AppHeaderProps {
  schemeTitle: string;
}

export function AppHeader({ schemeTitle }: AppHeaderProps) {
  return (
    <header className="app-header">
      <p className="app-header__eyebrow">Fabric Maze Planning Console</p>
      <h1>LABIRINTER</h1>
      <p className="app-header__scheme-title">{schemeTitle || 'Untitled scheme'}</p>
      <p className="app-header__lede">
        Configure the rope grid, light up wall segments, and keep fabric takeoff tied to the exact maze
        plan and perimeter treatment.
      </p>
    </header>
  );
}
