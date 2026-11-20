import type { ServiceType } from '@/types';

export const serviceTypes: ServiceType[] = [
  {
    id: 'svc_ev_diagnosis',
    name: 'EV diagnosis',
    category: 'Diagnostics',
    estimatedDurationMin: 90,
    description: 'Scan, isolate, and explain EV fault codes and drivability issues.',
  },
  {
    id: 'svc_hybrid_repair',
    name: 'Hybrid repair',
    category: 'Repair',
    estimatedDurationMin: 180,
    description: 'Hybrid system diagnosis and component repair.',
  },
  {
    id: 'svc_hv_battery',
    name: 'HV battery service',
    category: 'Battery',
    estimatedDurationMin: 240,
    description: 'High-voltage battery inspection, health testing, and module service.',
  },
  {
    id: 'svc_12v',
    name: '12V battery',
    category: 'Battery',
    estimatedDurationMin: 60,
    description: '12V support battery test, charge, and replacement.',
  },
  {
    id: 'svc_thermal',
    name: 'Coolant / thermal system',
    category: 'Thermal',
    estimatedDurationMin: 150,
    description: 'Battery and powertrain cooling, pumps, and thermal-circuit service.',
  },
  {
    id: 'svc_charging',
    name: 'Charging system',
    category: 'Charging',
    estimatedDurationMin: 120,
    description: 'Onboard charger, charge port, and charging-fault diagnosis.',
  },
  {
    id: 'svc_brakes',
    name: 'Brakes',
    category: 'Chassis',
    estimatedDurationMin: 90,
    description: 'Pad, rotor, and regenerative-braking related service.',
  },
  {
    id: 'svc_tires',
    name: 'Tires',
    category: 'Chassis',
    estimatedDurationMin: 60,
    description: 'Mount, balance, rotate, and EV-specific tire replacement.',
  },
  {
    id: 'svc_pm',
    name: 'Preventive maintenance',
    category: 'Maintenance',
    estimatedDurationMin: 75,
    description: 'Inspection, fluids, filters, and EV/hybrid health check.',
  },
];

export function getServiceType(id: string) {
  return serviceTypes.find((service) => service.id === id);
}
