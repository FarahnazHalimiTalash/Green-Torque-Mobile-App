import type { ShopState } from "./types";

export const DEMO_CUSTOMER_EMAIL = "farahnaz@greentorque.demo";
export const DEMO_CUSTOMER_PASSWORD = "demo123";
export const DEMO_STAFF_PASSWORD = "shop123";

const hoursAgo = (hours: number) => new Date(Date.now() - 1000 * 60 * 60 * hours).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * days).toISOString();

function nextOpenDay(hour: number, extraDays = 1) {
  const date = new Date();
  date.setDate(date.getDate() + extraDays);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function createShopState(): ShopState {
  return {
    shop: {
      id: "shop_green_torque",
      name: "Green Torque Hybrid & EV Repair",
      phone: "(555) 014-2208",
      address: "Shop address TBD",
    },
    staff: [
      {
        id: "staff_maya",
        fullName: "Maya Chen",
        email: "advisor@greentorque.demo",
        phone: "(555) 014-2210",
        role: "admin",
        password: DEMO_STAFF_PASSWORD,
        title: "Admin",
      },
      {
        id: "staff_nora",
        fullName: "Nora Patel",
        email: "subadmin@greentorque.demo",
        phone: "(555) 014-2212",
        role: "sub_admin",
        password: DEMO_STAFF_PASSWORD,
        title: "Sub-admin",
      },
      {
        id: "staff_luis",
        fullName: "Luis Ortega",
        email: "tech@greentorque.demo",
        phone: "(555) 014-2211",
        role: "technician",
        password: DEMO_STAFF_PASSWORD,
        title: "EV technician",
      },
    ],
    customers: [
      {
        id: "cust_farahnaz",
        fullName: "Farahnaz",
        email: DEMO_CUSTOMER_EMAIL,
        phone: "(555) 014-2208",
        role: "customer",
        password: DEMO_CUSTOMER_PASSWORD,
        paymentMethods: [],
      },
      {
        id: "cust_omar",
        fullName: "Omar Haddad",
        email: "omar@greentorque.demo",
        phone: "(555) 018-4402",
        role: "customer",
        password: DEMO_CUSTOMER_PASSWORD,
        paymentMethods: [],
      },
    ],
    vehicles: [
      {
        id: "veh_model3",
        customerId: "cust_farahnaz",
        vin: "5YJ3E1EA8PF123456",
        year: 2023,
        make: "Tesla",
        model: "Model 3",
        trim: "Long Range",
        mileage: 28410,
        nickname: "Model 3",
        evType: "ev",
        photoUrl:
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "veh_prius",
        customerId: "cust_omar",
        vin: "JTDKAMFU0N3123456",
        year: 2022,
        make: "Toyota",
        model: "Prius Prime",
        mileage: 41220,
        nickname: "Prius",
        evType: "hybrid",
      },
    ],
    appointments: [
      {
        id: "apt_10452",
        customerId: "cust_farahnaz",
        vehicleId: "veh_model3",
        serviceTypeId: "svc_thermal",
        scheduledAt: hoursAgo(26),
        status: "checked_in",
        notes: "Cabin heat takes a long time and I noticed a sweet smell near the frunk.",
        photoUris: [],
        videoUris: [],
        createdAt: hoursAgo(48),
      },
      {
        id: "apt_today_omar",
        customerId: "cust_omar",
        vehicleId: "veh_prius",
        serviceTypeId: "svc_hybrid_repair",
        scheduledAt: nextOpenDay(10),
        status: "confirmed",
        notes: "Check engine light after highway driving. Hybrid battery fan sounds loud.",
        photoUris: [],
        videoUris: [],
        createdAt: hoursAgo(10),
      },
      {
        id: "apt_today_omar_pm",
        customerId: "cust_omar",
        vehicleId: "veh_prius",
        serviceTypeId: "svc_hybrid_repair",
        scheduledAt: nextOpenDay(14),
        status: "confirmed",
        notes: "Follow-up hybrid inspection in the afternoon.",
        photoUris: [],
        videoUris: [],
        createdAt: hoursAgo(9),
      },
    ],
    bays: [
      { id: "bay_1", name: "Bay 1" },
      { id: "bay_2", name: "Bay 2" },
      { id: "bay_3", name: "Bay 3" },
    ],
    repairOrders: [
      {
        id: "ro_10452",
        number: "10452",
        appointmentId: "apt_10452",
        vehicleId: "veh_model3",
        customerId: "cust_farahnaz",
        assignedTechnicianId: "staff_luis",
        assignedSubAdminId: "staff_nora",
        bayId: "bay_3",
        serviceSummary: "Coolant / thermal system",
        bayName: "Bay 3",
        status: "in_progress",
        openedAt: hoursAgo(5),
        notes: [
          {
            id: "note_1",
            body: "Confirmed leak at the electric coolant pump housing. Thermal circuit is losing pressure under load.",
            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            visibleToCustomer: true,
          },
          {
            id: "note_internal",
            body: "Order OEM pump. Bleed procedure after install. Do not return to customer until leak-down test passes.",
            createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
            visibleToCustomer: false,
          },
        ],
        media: [
          {
            id: "media_video_1",
            kind: "video_clip",
            caption: "We found the issue with your Model 3. The coolant pump is leaking here…",
            durationSec: 32,
            createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
            visibleToCustomer: true,
          },
        ],
        parts: [
          {
            id: "part_1",
            name: "OEM electric coolant pump",
            partNumber: "TES-CP-183",
            qty: 1,
            unitCost: 680,
          },
        ],
        labor: [
          {
            id: "labor_1",
            description: "Thermal system repair",
            hours: 4,
            rate: 140,
          },
        ],
        diagnosisCharge: {
          amount: 149,
          description: "Vehicle diagnosis",
          status: "sent",
          sentAt: hoursAgo(4),
        },
        estimate: {
          id: "est_10452",
          amount: 1240,
          status: "sent",
          sentAt: hoursAgo(1),
          lines: [
            { id: "line_1", name: "OEM electric coolant pump", amount: 680 },
            { id: "line_2", name: "Labor — thermal system repair", amount: 560 },
          ],
        },
        foundProblems: [
          {
            id: "fp_brakes",
            summary: "Front brake pads are worn and need replacement.",
            createdAt: hoursAgo(1),
            estimate: {
              id: "est_brakes",
              amount: 420,
              status: "sent",
              sentAt: hoursAgo(1),
              lines: [{ id: "line_brakes", name: "Front brake pad replacement", amount: 420 }],
            },
          },
        ],
      },
      {
        id: "ro_10118",
        number: "10118",
        vehicleId: "veh_model3",
        customerId: "cust_farahnaz",
        serviceSummary: "Brake service",
        status: "picked_up",
        openedAt: daysAgo(86),
        readyAt: daysAgo(85),
        pickedUpAt: daysAgo(85),
        notes: [
          {
            id: "note_old",
            body: "Replaced front pads and resurfaced rotors. Regenerative braking is operating normally.",
            createdAt: daysAgo(85),
            visibleToCustomer: true,
          },
        ],
        media: [],
        parts: [],
        labor: [],
        diagnosisCharge: {
          amount: 129,
          description: "Vehicle diagnosis",
          status: "sent",
          sentAt: daysAgo(86),
        },
        estimate: {
          id: "est_10118",
          amount: 420,
          status: "approved",
          sentAt: daysAgo(86),
          respondedAt: daysAgo(86),
          lines: [{ id: "line_old", name: "Front brake service", amount: 420 }],
        },
      },
    ],
    conversations: [
      {
        id: "convo_farahnaz",
        customerId: "cust_farahnaz",
        repairOrderId: "ro_10452",
        messages: [
          {
            id: "msg_1",
            sender: "shop",
            body: "Hi Farahnaz — your Model 3 is in Bay 3. We found a leaking coolant pump and sent an estimate.",
            createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
          },
          {
            id: "msg_2",
            sender: "customer",
            body: "Thank you. I’ll review the estimate now.",
            createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          },
        ],
      },
    ],
    notifications: [
      {
        id: "ntf_video",
        userId: "cust_farahnaz",
        title: "New video update",
        body: "Green Torque posted a 32-second update on your Model 3.",
        createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
        read: false,
        href: "/(app)/repair/ro_10452",
      },
      {
        id: "ntf_estimate",
        userId: "cust_farahnaz",
        title: "Estimate ready",
        body: "Repair order #10452 estimate is $1,240. Approve or decline in the app.",
        createdAt: hoursAgo(1),
        read: false,
        href: "/(app)/repair/ro_10452",
      },
      {
        id: "ntf_checkin",
        userId: "cust_farahnaz",
        title: "Vehicle checked in",
        body: "Your 2023 Tesla Model 3 is in Bay 3.",
        createdAt: hoursAgo(5),
        read: true,
        href: "/(app)/repair/ro_10452",
      },
    ],
    payments: [],
    auditLog: [],
    nextRepairNumber: 10453,
  };
}
