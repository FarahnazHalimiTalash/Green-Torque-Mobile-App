export type UserRole = 'customer' | 'technician' | 'advisor' | 'admin' | 'sub_admin';
export type EvType = 'ev' | 'hybrid' | 'ice';

export type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'checked_in'
  | 'cancelled'
  | 'completed';

export type RepairStatus =
  | 'checked_in'
  | 'diagnosis'
  | 'in_progress'
  | 'inspection'
  | 'ready'
  | 'picked_up'
  | 'cancelled';

export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'declined' | 'expired';

export type MediaKind = 'photo' | 'video_clip' | 'diagnostic_report';

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

export type ServiceType = {
  id: string;
  name: string;
  category: string;
  estimatedDurationMin: number;
  description: string;
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

export type DiagnosisCharge = {
  amount: number;
  description: string;
  status: 'draft' | 'sent';
  sentAt?: string;
};

export type FoundProblem = {
  id: string;
  summary: string;
  createdAt: string;
  estimate: Estimate;
};

export type SavedPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
  addedAt: string;
};

export type ShopPayment = {
  id: string;
  customerId: string;
  repairOrderId: string;
  sourceId: string;
  kind: 'diagnosis' | 'estimate' | 'found_problem';
  amount: number;
  description: string;
  paidAt: string;
  methodBrand: string;
  methodLast4: string;
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
};

export type Conversation = {
  id: string;
  customerId: string;
  repairOrderId?: string;
  messages: ShopMessage[];
};

export type RepairOrder = {
  id: string;
  number: string;
  appointmentId?: string;
  vehicleId: string;
  customerId: string;
  assignedTechnicianId?: string;
  assignedSubAdminId?: string;
  bayId?: string;
  serviceSummary: string;
  bayName?: string;
  status: RepairStatus;
  openedAt: string;
  readyAt?: string;
  pickedUpAt?: string;
  notes: TechnicianNote[];
  media: MediaItem[];
  parts: PartLine[];
  labor: LaborLine[];
  diagnosisCharge?: DiagnosisCharge;
  estimate?: Estimate;
  foundProblems?: FoundProblem[];
};

export type StaffAccount = Profile & {
  password: string;
  title: string;
};

export type CustomerAccount = Profile & {
  password: string;
  paymentMethods?: SavedPaymentMethod[];
};

export type CustomerSnapshot = {
  profile: Profile;
  vehicles: Vehicle[];
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  messages: ShopMessage[];
  notifications: AppNotification[];
  selectedVehicleId: string | null;
  paymentMethods: SavedPaymentMethod[];
  payments: ShopPayment[];
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
  conversations: Conversation[];
  notifications: Array<AppNotification & { userId: string }>;
  payments: ShopPayment[];
  nextRepairNumber: number;
};

export type ShopMessage = {
  id: string;
  sender: 'customer' | 'shop';
  body: string;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type AccountState = {
  password: string;
  profile: Profile;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  messages: ShopMessage[];
  notifications: AppNotification[];
  paymentMethods: SavedPaymentMethod[];
  payments: ShopPayment[];
};

export type PersistedStore = {
  currentEmail: string | null;
  accounts: Record<string, AccountState>;
};
