import { describe, it, expect } from 'vitest';
import { canTransition, isTerminal } from '../order-state-machine.js';

describe('Order State Machine', () => {
  it('allows admin: pending → processing', () => { expect(canTransition('pending', 'processing', 'admin')).toBe(true); });
  it('allows admin: pending → cancelled', () => { expect(canTransition('pending', 'cancelled', 'admin')).toBe(true); });
  it('allows customer: pending → cancelled', () => { expect(canTransition('pending', 'cancelled', 'customer')).toBe(true); });
  it('denies customer: pending → processing', () => { expect(canTransition('pending', 'processing', 'customer')).toBe(false); });
  it('allows staff: processing → shipped', () => { expect(canTransition('processing', 'shipped', 'staff')).toBe(true); });
  it('allows staff: shipped → delivered', () => { expect(canTransition('shipped', 'delivered', 'staff')).toBe(true); });
  it('denies staff: processing → cancelled', () => { expect(canTransition('processing', 'cancelled', 'staff')).toBe(false); });
  it('denies any: delivered → any', () => {
    expect(canTransition('delivered', 'cancelled', 'admin')).toBe(false);
    expect(canTransition('delivered', 'pending', 'admin')).toBe(false);
  });
  it('denies any: cancelled → any', () => { expect(canTransition('cancelled', 'pending', 'admin')).toBe(false); });
  it('identifies terminal states', () => {
    expect(isTerminal('delivered')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('pending')).toBe(false);
  });
});
