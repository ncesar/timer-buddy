import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { WorkoutEditorPage } from '@/pages/WorkoutEditorPage'
import { TrainingPage } from '@/pages/TrainingPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workout/new" element={<WorkoutEditorPage />} />
      <Route path="/workout/:id" element={<WorkoutEditorPage />} />
      <Route path="/workout/:id/train" element={<TrainingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  </BrowserRouter>
)
