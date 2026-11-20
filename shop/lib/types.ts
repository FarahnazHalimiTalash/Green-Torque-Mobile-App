export type UserRole = "customer" | "technician" | "advisor" | "admin";
export type EvType = "ev" | "hybrid" | "ice";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "checked_in"
  | "cancelled"
  | "completed";

export type RepairStatus =
  | "checked_in"
  | "diagnosis"
  | "in_progress"
  | "inspection"
  | "ready"
  | "picked_up"
  | "cancelled";

export type EstimateStatus = "draft" | "sent" | "approved" | "declined" | "expired";
export type MediaKind = "photo" | "video_clip" | "diagnostic_report" | "live_session";

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
};

export type Vehicle = {
  id: string;
  customerId: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  nickname?: string;
  evType: EvType;
  photoUrl?: string;
};

export type Appointment = {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceTypeId: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string;
  photoUris: string[];
  videoUris: string[];
  createdAt: string;
};

export type TechnicianNote = {
  id: string;
  body: string;
  createdAt: string;
  visibleToCustomer: boolean;
};

export type MediaItem = {
  id: string;
  kind: MediaKind;
  caption: string;
  uri?: string;
  durationSec?: number;
  createdAt: string;
  visibleToCustomer: boolean;
};

export type EstimateLine = {
  id: string;
  name: string;
  amount: number;
};

export type Estimate = {
  id: string;
  amount: number;
  status: EstimateStatus;
  lines: EstimateLine[];
  sentAt?: string;
  respondedAt?: string;
};

export type PartLine = {
  id: string;
  name: string;
  partNumber?: string;
  qty: number;
  unitCost: number;
};

export type LaborLine = {
  id: string;
  description: string;
  hours: number;
  rate: number;
};

export type WorkBay = {
  id: string;
  name: string;
  cameraId?: string;
};

export type Camera = {
  id: string;
  name: string;
  isActive: boolean;
};

export type ShopMessage = {
  id: string;
  sender: "customer" | "shop";
  body: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  customerId: string;
  repairOrderId?: string;
  messages: ShopMessage[];
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type RepairOrder = {
  id: string;
  number: string;
  appointmentId?: string;
  vehicleId: string;
  customerId: string;
  assignedTechnicianId?: string;
  bayId?: string;
  cameraId?: string;
  serviceSummary: string;
  bayName?: string;
  cameraName?: string;
  status: RepairStatus;
  openedAt: string;
  readyAt?: string;
  pickedUpAt?: string;
  notes: TechnicianNote[];
  media: MediaItem[];
  parts: PartLine[];
  labor: LaborLine[];
  estimate?: Estimate;
};

export type StaffAccount = Profile & {
  password: string;
  title: string;
};

export type CustomerAccount = Profile & {
  password: string;
};

export type ShopState = {
  shop: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  staff: StaffAccount[];
  customers: CustomerAccount[];
  vehicles: Vehicle[];
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  bays: WorkBay[];
  cameras: Camera[];
  conversations: Conversation[];
  notifications: AppNotification[];
  nextRepairNumber: number;
};

export type CustomerSnapshot = {
  profile: Profile;
  vehicles: Vehicle[];
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  messages: ShopMessage[];
  notifications: Array<Omit<AppNotification, "userId">>;
  selectedVehicleId: string | null;
};

export const serviceTypes = [
  { id: "svc_ev_diagnosis", name: "EV diagnosis" },
  { id: "svc_hybrid_repair", name: "Hybrid repair" },
  { id: "svc_hv_battery", name: "HV battery service" },
  { id: "svc_12v", name: "12V battery" },
  { id: "svc_thermal", name: "Coolant / thermal system" },
  { id: "svc_charging", name: "Charging system" },
  { id: "svc_brakes", name: "Brakes" },
  { id: "svc_tires", name: "Tires" },
  { id: "svc_pm", name: "Preventive maintenance" },
];
