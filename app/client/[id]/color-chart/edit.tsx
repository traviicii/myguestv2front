import { EditColorChartScreen } from 'components/colorChart/edit/sections'
import { useEditColorChartScreenModel } from 'components/colorChart/edit/useEditColorChartScreenModel'

export default function EditClientColorChartScreen() {
  const model = useEditColorChartScreenModel()
  return <EditColorChartScreen model={model} />
}
