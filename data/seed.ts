import type { AccountState } from '@/types';

export const DEMO_EMAIL = 'farahnaz@greentorque.demo';
export const DEMO_PASSWORD = 'demo123';

export function createDemoAccount(): AccountState {
  const customerId = 'cust_farahnaz';
  const vehicleId = 'veh_model3';
  const repairId = 'ro_10452';

  return {
    password: DEMO_PASSWORD,
    profile: {
      id: customerId,
      fullName: 'Farahnaz',
      email: DEMO_EMAIL,
      phone: '(555) 014-2208',
      role: 'customer',
    },
    selectedVehicleId: vehicleId,
    vehicles: [
      {
        id: vehicleId,
        customerId,
        vin: '5YJ3E1EA8PF123456',
        year: 2023,
        make: 'Tesla',
        model: 'Model 3',
        trim: 'Long Range',
        mileage: 28410,
        nickname: 'Model 3',
        evType: 'ev',
        photoUrl:
          'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    appointments: [
      {
        id: 'apt_10452',
        customerId,
        vehicleId,
        serviceTypeId: 'svc_thermal',
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        status: 'checked_in',
        notes: 'Cabin heat takes a long time and I noticed a sweet smell near the frunk.',
        photoUris: [],
        videoUris: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ],
    repairOrders: [
      {
        id: repairId,
        number: '10452',
        appointmentId: 'apt_10452',
        vehicleId,
        customerId,
        serviceSummary: 'Coolant / thermal system',
        bayName: 'Bay 3',
        status: 'in_progress',
        openedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        notes: [
          {
            id: 'note_1',
            body: 'Confirmed leak at the electric coolant pump housing. Thermal circuit is losing pressure under load.',
            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            visibleToCustomer: true,
          },
          {
            id: 'note_internal',
            body: 'Order OEM pump. Bleed procedure after install. Do not return to customer until leak-down test passes.',
            createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
            visibleToCustomer: false,
          },
        ],
        media: [
          {
            id: 'media_video_1',
            kind: 'video_clip',
            caption:
              'We found the issue with your Model 3. The coolant pump is leaking here…',
            durationSec: 32,
            createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
            visibleToCustomer: true,
          },
        ],
        parts: [
          {
            id: 'part_1',
            name: 'OEM electric coolant pump',
            partNumber: 'TES-CP-183',
            qty: 1,
            unitCost: 680,
          },
        ],
        labor: [
          {
            id: 'labor_1',
            description: 'Thermal system repair',
            hours: 4,
            rate: 140,
          },
        ],
        diagnosisCharge: {
          amount: 149,
          description: 'Vehicle diagnosis',
          status: 'sent',
          sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        },
        estimate: {
          id: 'est_10452',
          amount: 1240,
          status: 'sent',
          sentAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          lines: [
            { id: 'line_1', name: 'OEM electric coolant pump', amount: 680 },
            { id: 'line_2', name: 'Labor — thermal system repair', amount: 560 },
          ],
        },
        foundProblems: [
          {
            id: 'fp_brakes',
            summary: 'Front brake pads are worn and need replacement.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            estimate: {
              id: 'est_brakes',
              amount: 420,
              status: 'sent',
              sentAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              lines: [{ id: 'line_brakes', name: 'Front brake pad replacement', amount: 420 }],
            },
          },
        ],
      },
      {
        id: 'ro_10118',
        number: '10118',
        vehicleId,
        customerId,
        serviceSummary: 'Brake service',
        status: 'picked_up',
        openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 86).toISOString(),
        readyAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 85).toISOString(),
        pickedUpAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 85).toISOString(),
        notes: [
          {
            id: 'note_old',
            body: 'Replaced front pads and resurfaced rotors. Regenerative braking is operating normally.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 85).toISOString(),
            visibleToCustomer: true,
          },
        ],
        media: [],
        parts: [],
        labor: [],
        diagnosisCharge: {
          amount: 129,
          description: 'Vehicle diagnosis',
          status: 'sent',
          sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 86).toISOString(),
        },
        estimate: {
          id: 'est_10118',
          amount: 420,
          status: 'approved',
          sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 86).toISOString(),
          respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 86).toISOString(),
          lines: [{ id: 'line_old', name: 'Front brake service', amount: 420 }],
        },
      },
    ],
    messages: [
      {
        id: 'msg_1',
        sender: 'shop',
        body: 'Hi Farahnaz — your Model 3 is in Bay 3. We found a leaking coolant pump and sent an estimate.',
        createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      },
      {
        id: 'msg_2',
        sender: 'customer',
        body: 'Thank you. I’ll review the estimate now.',
        createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      },
    ],
    paymentMethods: [],
    payments: [],
    notifications: [
      {
        id: 'ntf_video',
        title: 'New video update',
        body: 'Green Torque posted a 32-second update on your Model 3.',
        createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
        read: false,
        href: '/(app)/repair/ro_10452',
      },
      {
        id: 'ntf_estimate',
        title: 'Estimate ready',
        body: 'Repair order #10452 estimate is $1,240. Approve or decline in the app.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: false,
        href: '/(app)/repair/ro_10452',
      },
      {
        id: 'ntf_checkin',
        title: 'Vehicle checked in',
        body: 'Your 2023 Tesla Model 3 is in Bay 3.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: true,
        href: '/(app)/repair/ro_10452',
      },
    ],
  };
}
