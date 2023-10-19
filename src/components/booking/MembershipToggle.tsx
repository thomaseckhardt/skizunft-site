import { useWatch } from 'react-hook-form'
import Toggle from './Toggle'

export default function MembershipToggle({
  control,
  input,
  attendeeNameField,
}) {
  const attendeeName = useWatch({
    control,
    name: attendeeNameField,
  })

  return (
    <div className="flex items-center">
      <Toggle control={control} input={input} label="Vereinsmitgliedschaft" />
      <span className="ml-3 text-sm leading-tight">
        <span className="font-medium text-gray-900">
          Ist {attendeeName || 'das Kind'} Vereinsmitglied
        </span>
        <span className="text-gray-500"> (Spare 10 € pro Kurs)</span>
      </span>
    </div>
  )
}
