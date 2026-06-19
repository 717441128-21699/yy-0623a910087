import Taro from '@tarojs/taro'
import type { BondingTask, FollowUpRecord } from '@/types'
import { mockBondingTasks, mockFollowUpRecords } from '@/data/mock'

const BONDING_KEY = 'ortho_bonding_tasks'
const FOLLOWUP_KEY = 'ortho_followup_records'
const INIT_FLAG = 'ortho_store_initialized'

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(key)
    if (raw && typeof raw === 'string') {
      return JSON.parse(raw) as T
    }
  } catch (e) {
    console.error('[Store] read error', key, e)
  }
  return fallback
}

function safeSet<T>(key: string, value: T): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.error('[Store] write error', key, e)
  }
}

function ensureInit(): void {
  const flag = Taro.getStorageSync(INIT_FLAG)
  if (!flag) {
    safeSet(BONDING_KEY, mockBondingTasks)
    safeSet(FOLLOWUP_KEY, mockFollowUpRecords)
    Taro.setStorageSync(INIT_FLAG, '1')
  }
}

export function getBondingTasks(): BondingTask[] {
  ensureInit()
  return safeGet<BondingTask[]>(BONDING_KEY, mockBondingTasks)
}

export function saveBondingTasks(tasks: BondingTask[]): void {
  safeSet(BONDING_KEY, tasks)
}

export function addBondingTask(task: BondingTask): void {
  const tasks = getBondingTasks()
  tasks.unshift(task)
  saveBondingTasks(tasks)
}

export function findBondingTask(id: string): BondingTask | undefined {
  return getBondingTasks().find(t => t.id === id)
}

export function getFollowUpRecords(): FollowUpRecord[] {
  ensureInit()
  return safeGet<FollowUpRecord[]>(FOLLOWUP_KEY, mockFollowUpRecords)
}

export function saveFollowUpRecords(records: FollowUpRecord[]): void {
  safeSet(FOLLOWUP_KEY, records)
}

export function addFollowUpRecord(record: FollowUpRecord): void {
  const records = getFollowUpRecords()
  records.unshift(record)
  saveFollowUpRecords(records)
}

export function findFollowUpRecord(id: string): FollowUpRecord | undefined {
  return getFollowUpRecords().find(r => r.id === id)
}

export function getPatientBondingHistory(patientId: string): BondingTask[] {
  return getBondingTasks().filter(t => t.patientId === patientId && t.status === 'completed')
}

export function getPatientFollowUpHistory(patientId: string): FollowUpRecord[] {
  return getFollowUpRecords().filter(r => r.patientId === patientId)
}

export function hasPatientBondingHistory(patientId: string): boolean {
  return getBondingTasks().some(t => t.patientId === patientId && t.status === 'completed')
}
