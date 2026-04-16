import { DashboardEditorLayout } from '../../../widgets/dashboard/ui/DashboardEditorLayout';
import { DashboardEditorShell } from '../../../widgets/shell/ui/DashboardEditorShell';

export function HomePage() {
  return (
    <DashboardEditorShell>
      <DashboardEditorLayout />
    </DashboardEditorShell>
  );
}
