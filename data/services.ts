import type { EvType, ServiceType } from '@/types';

export type ServiceGroupId = 'ev' | 'hybrid' | 'ice' | 'general';

export const SERVICE_GROUPS: { id: ServiceGroupId; label: string }[] = [
  { id: 'ev', label: 'Electric Vehicle (EV) Services' },
  { id: 'hybrid', label: 'Hybrid Vehicle Services' },
  { id: 'ice', label: 'Gasoline Vehicle Services' },
  { id: 'general', label: 'General Auto Services' },
];

function svc(
  id: string,
  name: string,
  category: ServiceGroupId,
  estimatedDurationMin = 90,
): ServiceType {
  return { id, name, category, estimatedDurationMin, description: name };
}

export const serviceTypes: ServiceType[] = [
  svc('svc_ev_diagnosis', 'EV system diagnostics', 'ev', 90),
  svc('svc_hv_battery', 'High-voltage battery diagnostics', 'ev', 120),
  svc('svc_ev_battery_health', 'EV battery health testing', 'ev', 90),
  svc('svc_ev_battery_repair', 'Battery replacement and repair', 'ev', 240),
  svc('svc_charging', 'Charging-system diagnostics', 'ev', 90),
  svc('svc_ev_charge_port', 'AC and DC charging-port repair', 'ev', 120),
  svc('svc_ev_obc', 'On-board charger repair', 'ev', 180),
  svc('svc_ev_dcdc', 'DC-DC converter diagnostics', 'ev', 120),
  svc('svc_ev_inverter', 'Inverter and power electronics service', 'ev', 180),
  svc('svc_ev_motor', 'Electric motor diagnostics', 'ev', 120),
  svc('svc_ev_thermal', 'Thermal-management system service', 'ev', 150),
  svc('svc_thermal', 'EV coolant replacement', 'ev', 90),
  svc('svc_12v', '12-volt battery testing and replacement', 'ev', 45),
  svc('svc_brakes', 'Brake inspection and repair', 'ev', 90),
  svc('svc_ev_regen', 'Regenerative-braking system inspection', 'ev', 75),
  svc('svc_ev_suspension', 'Suspension and steering repair', 'ev', 120),
  svc('svc_tires', 'Tire replacement and alignment', 'ev', 60),
  svc('svc_ev_software', 'Software and fault-code diagnostics', 'ev', 75),
  svc('svc_ev_ppi', 'Pre-purchase EV inspection', 'ev', 90),

  svc('svc_hybrid_repair', 'Hybrid system diagnostics', 'hybrid', 120),
  svc('svc_hybrid_battery_test', 'Hybrid battery testing', 'hybrid', 90),
  svc('svc_hybrid_battery_replace', 'Hybrid battery replacement', 'hybrid', 240),
  svc('svc_hybrid_battery_cooling', 'Hybrid battery cooling-system service', 'hybrid', 120),
  svc('svc_hybrid_inverter', 'Inverter and converter diagnostics', 'hybrid', 120),
  svc('svc_hybrid_motor', 'Electric motor-generator diagnostics', 'hybrid', 120),
  svc('svc_hybrid_warning', 'Hybrid system warning-light diagnosis', 'hybrid', 75),
  svc('svc_hybrid_regen', 'Regenerative-braking service', 'hybrid', 90),
  svc('svc_hybrid_engine', 'Engine and transmission diagnostics', 'hybrid', 120),
  svc('svc_hybrid_12v', '12-volt battery replacement', 'hybrid', 45),
  svc('svc_hybrid_cooling', 'Cooling-system service', 'hybrid', 90),
  svc('svc_hybrid_brakes', 'Brake repair and maintenance', 'hybrid', 90),
  svc('svc_hybrid_suspension', 'Suspension and steering repair', 'hybrid', 120),
  svc('svc_hybrid_tires', 'Tire replacement and alignment', 'hybrid', 60),
  svc('svc_hybrid_ppi', 'Pre-purchase hybrid inspection', 'hybrid', 90),

  svc('svc_ice_cel', 'Check-engine-light diagnostics', 'ice', 75),
  svc('svc_ice_engine', 'Engine diagnostics and repair', 'ice', 180),
  svc('svc_ice_oil', 'Oil and filter changes', 'ice', 45),
  svc('svc_ice_brakes', 'Brake inspection and repair', 'ice', 90),
  svc('svc_ice_transmission', 'Transmission service and repair', 'ice', 180),
  svc('svc_ice_battery', 'Battery testing and replacement', 'ice', 45),
  svc('svc_ice_charging', 'Alternator and starter repair', 'ice', 120),
  svc('svc_ice_cooling', 'Cooling-system service', 'ice', 90),
  svc('svc_ice_radiator', 'Radiator and water-pump repair', 'ice', 150),
  svc('svc_ice_belts', 'Belt and hose replacement', 'ice', 75),
  svc('svc_ice_ignition', 'Spark-plug and ignition service', 'ice', 90),
  svc('svc_ice_fuel', 'Fuel-system diagnostics', 'ice', 90),
  svc('svc_ice_hvac', 'Air-conditioning and heating repair', 'ice', 120),
  svc('svc_ice_suspension', 'Suspension and steering repair', 'ice', 120),
  svc('svc_ice_tires', 'Tire replacement and wheel alignment', 'ice', 60),
  svc('svc_ice_emissions', 'Emissions and smog inspection preparation', 'ice', 75),
  svc('svc_ice_ppi', 'Pre-purchase inspection', 'ice', 90),
  svc('svc_ice_pm', 'Preventive maintenance', 'ice', 75),

  svc('svc_general_inspection', 'Vehicle inspections', 'general', 60),
  svc('svc_general_health', 'Digital vehicle health reports', 'general', 45),
  svc('svc_pm', 'Preventive maintenance', 'general', 75),
  svc('svc_general_fleet', 'Fleet vehicle service', 'general', 90),
  svc('svc_general_accident', 'Accident-related mechanical inspection', 'general', 90),
  svc('svc_general_media', 'Diagnostic reports with photos and videos', 'general', 45),
  svc('svc_general_estimate', 'Estimate preparation', 'general', 30),
  svc('svc_general_ro', 'Repair-order management', 'general', 30),
  svc('svc_general_parts', 'Parts and labor estimates', 'general', 30),
  svc('svc_general_delivery', 'Vehicle pickup and delivery', 'general', 60),
  svc('svc_general_roadtest', 'Road-test and quality inspection', 'general', 45),
  svc('svc_general_reminders', 'Maintenance reminders', 'general', 15),
  svc('svc_general_updates', 'Customer repair updates and notifications', 'general', 15),
];

export const SERVICE_GROUP_OPTIONS = SERVICE_GROUPS.map((group) => ({
  label: group.label,
  value: group.id,
}));

export function servicesForGroup(group: string) {
  return serviceTypes.filter((service) => service.category === group);
}

export function serviceGroupForPowertrain(evType?: EvType): ServiceGroupId {
  if (evType === 'hybrid') return 'hybrid';
  if (evType === 'ice') return 'ice';
  if (evType === 'ev') return 'ev';
  return 'ev';
}

export function getServiceType(id: string) {
  return serviceTypes.find((service) => service.id === id);
}
