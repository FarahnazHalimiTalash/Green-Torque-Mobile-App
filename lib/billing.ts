import type { RepairOrder, ShopPayment } from '@/types';

export type DueCharge = {
  sourceId: string;
  kind: 'diagnosis' | 'estimate' | 'found_problem';
  description: string;
  amount: number;
  repairOrderId: string;
  repairNumber: string;
};

export function dueChargesForOrder(order: RepairOrder, payments: ShopPayment[]): DueCharge[] {
  const paid = new Set(payments.filter((item) => item.repairOrderId === order.id).map((item) => item.sourceId));
  const due: DueCharge[] = [];

  if (order.diagnosisCharge?.status === 'sent' && !paid.has('diagnosis')) {
    due.push({
      sourceId: 'diagnosis',
      kind: 'diagnosis',
      description: order.diagnosisCharge.description || 'Vehicle diagnosis',
      amount: order.diagnosisCharge.amount,
      repairOrderId: order.id,
      repairNumber: order.number,
    });
  }

  if (order.estimate?.status === 'approved' && !paid.has(order.estimate.id)) {
    due.push({
      sourceId: order.estimate.id,
      kind: 'estimate',
      description: `Further service · #${order.number}`,
      amount: order.estimate.amount,
      repairOrderId: order.id,
      repairNumber: order.number,
    });
  }

  for (const problem of order.foundProblems ?? []) {
    if (problem.estimate.status === 'approved' && !paid.has(problem.estimate.id)) {
      due.push({
        sourceId: problem.estimate.id,
        kind: 'found_problem',
        description: problem.summary,
        amount: problem.estimate.amount,
        repairOrderId: order.id,
        repairNumber: order.number,
      });
    }
  }

  return due;
}

export function dueTotal(charges: DueCharge[]) {
  return charges.reduce((sum, item) => sum + item.amount, 0);
}
