import { Mail, MessageCircle, PlusCircle, UserPlus } from '@tamagui/lucide-icons'

import type { OverviewQuickAction } from './overviewModelTypes'

export const overviewQuickActions: OverviewQuickAction[] = [
  {
    id: 'newClient',
    label: 'New Client',
    icon: UserPlus,
    href: '/clients/new',
    variant: 'primary',
  },
  {
    id: 'newAppointmentLog',
    label: 'New Appointment Log',
    icon: PlusCircle,
    href: '/appointments/new',
    variant: 'secondary',
  },
  {
    id: 'newEmailAlert',
    label: 'New Email Alert',
    icon: Mail,
    variant: 'ghost',
    comingSoon: true,
  },
  {
    id: 'newTextAlert',
    label: 'New Text Alert',
    icon: MessageCircle,
    variant: 'ghost',
    comingSoon: true,
  },
]
