import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createDemoAccount, DEMO_EMAIL } from '@/data/seed';
import { createId } from '@/lib/ids';
import {
  shopAddVehicle,
  shopBookAppointment,
  shopCancelAppointment,
  shopCustomerLogin,
  shopDemoLogin,
  shopHealth,
  shopMarkNotification,
  shopPortal,
  shopRespondEstimate,
  shopSendMessage,
  shopSignup,
} from '@/lib/shop-api';
import type {
  AccountState,
  Appointment,
  AppNotification,
  EstimateStatus,
  PersistedStore,
  Profile,
  RepairOrder,
  ShopMessage,
  Vehicle,
} from '@/types';

const STORAGE_KEY = 'green-torque.store.v1';
const API_SESSION_KEY = 'green-torque.api.session.v1';

type SignUpInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

type VehicleInput = Omit<Vehicle, 'id' | 'customerId'>;

type BookInput = {
  vehicleId: string;
  serviceTypeId: string;
  scheduledAt: string;
  notes: string;
  photoUris: string[];
  videoUris: string[];
};

type AppContextValue = {
  ready: boolean;
  liveWithShop: boolean;
  account: AccountState | null;
  profile: Profile | null;
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  messages: ShopMessage[];
  notifications: AppNotification[];
  unreadCount: number;
  activeRepair: RepairOrder | null;
  upcomingAppointments: Appointment[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  addVehicle: (input: VehicleInput) => Promise<Vehicle>;
  selectVehicle: (id: string) => Promise<void>;
  bookAppointment: (input: BookInput) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  respondToEstimate: (repairOrderId: string, status: Extract<EstimateStatus, 'approved' | 'declined'>) => Promise<void>;
  sendMessage: (body: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function emptyAccount(input: SignUpInput): AccountState {
  const id = createId('cust');
  return {
    password: input.password,
    profile: {
      id,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      role: 'customer',
    },
    vehicles: [],
    selectedVehicleId: null,
    appointments: [],
    repairOrders: [],
    messages: [
      {
        id: createId('msg'),
        sender: 'shop',
        body: 'Welcome to Green Torque. Book a service any time and we’ll keep you updated here.',
        createdAt: new Date().toISOString(),
      },
    ],
    notifications: [
      {
        id: createId('ntf'),
        title: 'Welcome to Green Torque',
        body: 'Add a vehicle to start booking EV and hybrid service.',
        createdAt: new Date().toISOString(),
        read: false,
        href: '/(app)/vehicle/add',
      },
    ],
  };
}

async function loadStore(): Promise<PersistedStore> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { currentEmail: null, accounts: {} };
  }
  return JSON.parse(raw) as PersistedStore;
}

async function saveStore(store: PersistedStore) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [liveWithShop, setLiveWithShop] = useState(false);
  const [apiCustomerId, setApiCustomerId] = useState<string | null>(null);
  const [apiAccount, setApiAccount] = useState<AccountState | null>(null);
  const [store, setStore] = useState<PersistedStore>({ currentEmail: null, accounts: {} });

  useEffect(() => {
    (async () => {
      const local = await loadStore();
      setStore(local);
      const healthy = await shopHealth();
      setLiveWithShop(healthy);
      if (healthy) {
        const raw = await AsyncStorage.getItem(API_SESSION_KEY);
        if (raw) {
          const session = JSON.parse(raw) as { customerId: string };
          try {
            const snapshot = await shopPortal(session.customerId);
            setApiCustomerId(session.customerId);
            setApiAccount(snapshot);
          } catch {
            await AsyncStorage.removeItem(API_SESSION_KEY);
          }
        }
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!liveWithShop || !apiCustomerId) return;
    const timer = setInterval(() => {
      shopPortal(apiCustomerId)
        .then(setApiAccount)
        .catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [apiCustomerId, liveWithShop]);

  const persist = useCallback(async (next: PersistedStore) => {
    setStore(next);
    await saveStore(next);
  }, []);

  const saveApiSession = useCallback(async (customerId: string, account: AccountState) => {
    setApiCustomerId(customerId);
    setApiAccount(account);
    await AsyncStorage.setItem(API_SESSION_KEY, JSON.stringify({ customerId }));
  }, []);

  const updateAccount = useCallback(
    async (updater: (account: AccountState) => AccountState) => {
      const email = store.currentEmail;
      if (!email || !store.accounts[email]) {
        throw new Error('You need to sign in first.');
      }
      const nextAccount = updater(store.accounts[email]);
      await persist({
        ...store,
        accounts: { ...store.accounts, [email]: nextAccount },
      });
    },
    [persist, store],
  );

  const localAccount = store.currentEmail ? store.accounts[store.currentEmail] ?? null : null;
  const account = liveWithShop ? apiAccount : localAccount;

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (liveWithShop) {
        const result = await shopCustomerLogin(email, password);
        await saveApiSession(result.customerId, result.account);
        return;
      }
      const normalized = email.trim().toLowerCase();
      const latest = await loadStore();
      const existing = latest.accounts[normalized];
      if (!existing || existing.password !== password) {
        throw new Error('Check your email and password, or create an account.');
      }
      await persist({ ...latest, currentEmail: normalized });
    },
    [liveWithShop, persist, saveApiSession],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      if (liveWithShop) {
        const result = await shopSignup(input);
        await saveApiSession(result.customerId, result.account);
        return;
      }
      const normalized = input.email.trim().toLowerCase();
      if (!normalized.includes('@')) {
        throw new Error('Enter a valid email address.');
      }
      if (input.password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      const latest = await loadStore();
      if (latest.accounts[normalized]) {
        throw new Error('An account with that email already exists.');
      }
      const created = emptyAccount({ ...input, email: normalized });
      await persist({
        currentEmail: normalized,
        accounts: { ...latest.accounts, [normalized]: created },
      });
    },
    [liveWithShop, persist, saveApiSession],
  );

  const signInDemo = useCallback(async () => {
    if (liveWithShop) {
      const result = await shopDemoLogin();
      await saveApiSession(result.customerId, result.account);
      return;
    }
    const latest = await loadStore();
    const demo = latest.accounts[DEMO_EMAIL] ?? createDemoAccount();
    await persist({
      currentEmail: DEMO_EMAIL,
      accounts: { ...latest.accounts, [DEMO_EMAIL]: demo },
    });
  }, [liveWithShop, persist, saveApiSession]);

  const signOut = useCallback(async () => {
    setApiAccount(null);
    setApiCustomerId(null);
    await AsyncStorage.removeItem(API_SESSION_KEY);
    const latest = await loadStore();
    await persist({ ...latest, currentEmail: null });
  }, [persist]);

  const addVehicle = useCallback(
    async (input: VehicleInput) => {
      if (liveWithShop && apiCustomerId) {
        const next = await shopAddVehicle(apiCustomerId, input);
        if (next) setApiAccount(next);
        const created = next?.vehicles[0];
        if (!created) throw new Error('Vehicle was not saved.');
        return created;
      }
      const vehicle: Vehicle = {
        ...input,
        id: createId('veh'),
        customerId: account?.profile.id ?? '',
        vin: input.vin.trim().toUpperCase(),
        make: input.make.trim(),
        model: input.model.trim(),
        nickname: input.nickname?.trim() || undefined,
      };
      await updateAccount((current) => ({
        ...current,
        vehicles: [vehicle, ...current.vehicles],
        selectedVehicleId: vehicle.id,
        notifications: [
          {
            id: createId('ntf'),
            title: 'Vehicle added',
            body: `${vehicle.year} ${vehicle.make} ${vehicle.model} is ready for booking.`,
            createdAt: new Date().toISOString(),
            read: false,
            href: '/(app)/(tabs)/vehicles',
          },
          ...current.notifications,
        ],
      }));
      return vehicle;
    },
    [account?.profile.id, apiCustomerId, liveWithShop, updateAccount],
  );

  const selectVehicle = useCallback(
    async (id: string) => {
      if (liveWithShop && apiAccount) {
        setApiAccount({ ...apiAccount, selectedVehicleId: id });
        return;
      }
      await updateAccount((current) => ({ ...current, selectedVehicleId: id }));
    },
    [apiAccount, liveWithShop, updateAccount],
  );

  const bookAppointment = useCallback(
    async (input: BookInput) => {
      if (liveWithShop && apiCustomerId) {
        const next = await shopBookAppointment(apiCustomerId, input);
        if (next) setApiAccount(next);
        const created = next?.appointments[0];
        if (!created) throw new Error('Appointment was not saved.');
        return created;
      }
      const appointment: Appointment = {
        id: createId('apt'),
        customerId: account?.profile.id ?? '',
        vehicleId: input.vehicleId,
        serviceTypeId: input.serviceTypeId,
        scheduledAt: input.scheduledAt,
        status: 'requested',
        notes: input.notes.trim(),
        photoUris: input.photoUris,
        videoUris: input.videoUris,
        createdAt: new Date().toISOString(),
      };
      await updateAccount((current) => ({
        ...current,
        appointments: [appointment, ...current.appointments],
        notifications: [
          {
            id: createId('ntf'),
            title: 'Appointment requested',
            body: 'Green Torque will confirm your drop-off time shortly.',
            createdAt: new Date().toISOString(),
            read: false,
            href: `/(app)/appointment/${appointment.id}`,
          },
          ...current.notifications,
        ],
      }));
      return appointment;
    },
    [account?.profile.id, apiCustomerId, liveWithShop, updateAccount],
  );

  const cancelAppointment = useCallback(
    async (id: string) => {
      if (liveWithShop && apiCustomerId) {
        const next = await shopCancelAppointment(id);
        if (next) setApiAccount(await shopPortal(apiCustomerId));
        return;
      }
      await updateAccount((current) => ({
        ...current,
        appointments: current.appointments.map((item) =>
          item.id === id ? { ...item, status: 'cancelled' } : item,
        ),
      }));
    },
    [apiCustomerId, liveWithShop, updateAccount],
  );

  const respondToEstimate = useCallback(
    async (repairOrderId: string, status: Extract<EstimateStatus, 'approved' | 'declined'>) => {
      if (liveWithShop && apiCustomerId) {
        const next = await shopRespondEstimate(repairOrderId, apiCustomerId, status);
        if (next) setApiAccount(next);
        return;
      }
      await updateAccount((current) => ({
        ...current,
        repairOrders: current.repairOrders.map((order) =>
          order.id === repairOrderId && order.estimate
            ? {
                ...order,
                estimate: {
                  ...order.estimate,
                  status,
                  respondedAt: new Date().toISOString(),
                },
              }
            : order,
        ),
        messages: [
          ...current.messages,
          {
            id: createId('msg'),
            sender: 'customer',
            body:
              status === 'approved'
                ? 'Estimate approved. Please continue the repair.'
                : 'I need to decline this estimate for now. Please contact me before continuing.',
            createdAt: new Date().toISOString(),
          },
        ],
        notifications: [
          {
            id: createId('ntf'),
            title: status === 'approved' ? 'Estimate approved' : 'Estimate declined',
            body:
              status === 'approved'
                ? 'The shop can continue work on your vehicle.'
                : 'The shop has been notified that you declined the estimate.',
            createdAt: new Date().toISOString(),
            read: false,
            href: `/(app)/repair/${repairOrderId}`,
          },
          ...current.notifications,
        ],
      }));
    },
    [apiCustomerId, liveWithShop, updateAccount],
  );

  const sendMessage = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      if (liveWithShop && apiCustomerId) {
        const next = await shopSendMessage(apiCustomerId, trimmed);
        if (next) setApiAccount(next);
        return;
      }
      await updateAccount((current) => ({
        ...current,
        messages: [
          ...current.messages,
          {
            id: createId('msg'),
            sender: 'customer',
            body: trimmed,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [apiCustomerId, liveWithShop, updateAccount],
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (liveWithShop && apiCustomerId) {
        const next = await shopMarkNotification(apiCustomerId, id);
        if (next) setApiAccount(next);
        return;
      }
      await updateAccount((current) => ({
        ...current,
        notifications: current.notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      }));
    },
    [apiCustomerId, liveWithShop, updateAccount],
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (liveWithShop && apiCustomerId) {
      const next = await shopMarkNotification(apiCustomerId, undefined, true);
      if (next) setApiAccount(next);
      return;
    }
    await updateAccount((current) => ({
      ...current,
      notifications: current.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, [apiCustomerId, liveWithShop, updateAccount]);

  const vehicles = account?.vehicles ?? [];
  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === account?.selectedVehicleId) ?? vehicles[0] ?? null;
  const appointments = account?.appointments ?? [];
  const repairOrders = account?.repairOrders ?? [];
  const messages = account?.messages ?? [];
  const notifications = account?.notifications ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;
  const activeRepair =
    repairOrders.find(
      (order) =>
        order.status !== 'picked_up' &&
        order.status !== 'cancelled' &&
        (!selectedVehicle || order.vehicleId === selectedVehicle.id),
    ) ??
    repairOrders.find((order) => order.status !== 'picked_up' && order.status !== 'cancelled') ??
    null;
  const upcomingAppointments = appointments
    .filter((item) => item.status === 'requested' || item.status === 'confirmed')
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      liveWithShop,
      account,
      profile: account?.profile ?? null,
      vehicles,
      selectedVehicle,
      appointments,
      repairOrders,
      messages,
      notifications,
      unreadCount,
      activeRepair,
      upcomingAppointments,
      signIn,
      signUp,
      signInDemo,
      signOut,
      addVehicle,
      selectVehicle,
      bookAppointment,
      cancelAppointment,
      respondToEstimate,
      sendMessage,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      account,
      activeRepair,
      addVehicle,
      appointments,
      bookAppointment,
      cancelAppointment,
      liveWithShop,
      markAllNotificationsRead,
      markNotificationRead,
      messages,
      notifications,
      ready,
      repairOrders,
      respondToEstimate,
      selectVehicle,
      selectedVehicle,
      sendMessage,
      signIn,
      signInDemo,
      signOut,
      signUp,
      unreadCount,
      upcomingAppointments,
      vehicles,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return value;
}

export { DEMO_EMAIL } from '@/data/seed';
