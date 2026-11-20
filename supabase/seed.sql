insert into public.shops (name, phone, address, timezone)
values (
  'Green Torque Hybrid & EV Repair',
  '(555) 014-2208',
  'Shop address TBD',
  'America/Los_Angeles'
);

insert into public.service_types (shop_id, name, category, estimated_duration_min, description)
select
  shops.id,
  seed.name,
  seed.category,
  seed.estimated_duration_min,
  seed.description
from public.shops
cross join (
  values
    ('EV diagnosis', 'Diagnostics', 90, 'Scan, isolate, and explain EV fault codes and drivability issues.'),
    ('Hybrid repair', 'Repair', 180, 'Hybrid system diagnosis and component repair.'),
    ('HV battery service', 'Battery', 240, 'High-voltage battery inspection, health testing, and module service.'),
    ('12V battery', 'Battery', 60, '12V support battery test, charge, and replacement.'),
    ('Coolant / thermal system', 'Thermal', 150, 'Battery and powertrain cooling, pumps, and thermal-circuit service.'),
    ('Charging system', 'Charging', 120, 'Onboard charger, charge port, and charging-fault diagnosis.'),
    ('Brakes', 'Chassis', 90, 'Pad, rotor, and regenerative-braking related service.'),
    ('Tires', 'Chassis', 60, 'Mount, balance, rotate, and EV-specific tire replacement.'),
    ('Preventive maintenance', 'Maintenance', 75, 'Inspection, fluids, filters, and EV/hybrid health check.')
) as seed(name, category, estimated_duration_min, description)
where shops.name = 'Green Torque Hybrid & EV Repair';

insert into public.cameras (shop_id, name, provider, is_active)
select id, 'Camera 3', 'pending', true
from public.shops
where name = 'Green Torque Hybrid & EV Repair';

insert into public.work_bays (shop_id, name, camera_id)
select shops.id, 'Bay 3', cameras.id
from public.shops
join public.cameras on cameras.shop_id = shops.id
where shops.name = 'Green Torque Hybrid & EV Repair';
