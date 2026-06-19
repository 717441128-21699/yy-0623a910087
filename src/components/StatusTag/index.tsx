import React from 'react'
import { Text } from '@tarojs/components'
import styles from './index.module.scss'
import classnames from 'classnames'
import type { BondingTaskStatus, ToothStatus } from '@/types'

type TagType = 
  | 'primary' | 'success' | 'warning' | 'error' | 'default'
  | 'intact' | 'worn' | 'fallen' | 'rebond'
  | 'pending' | 'materialsChecked' | 'inProgress' | 'completed'

export interface StatusTagProps {
  type?: TagType
  text: string
}

const StatusTag: React.FC<StatusTagProps> = ({ type = 'default', text }) => {
  return (
    <Text className={classnames(styles.tag, styles[type])}>{text}</Text>
  )
}

export const BondingStatusTag: React.FC<{ status: BondingTaskStatus }> = ({ status }) => {
  const map: Record<BondingTaskStatus, { type: TagType; text: string }> = {
    pending: { type: 'pending', text: '待处理' },
    materials_checked: { type: 'materialsChecked', text: '材料已核对' },
    in_progress: { type: 'inProgress', text: '进行中' },
    completed: { type: 'completed', text: '已完成' }
  }
  const cfg = map[status]
  return <StatusTag type={cfg.type} text={cfg.text} />
}

export const ToothStatusTag: React.FC<{ status: ToothStatus }> = ({ status }) => {
  const map: Record<ToothStatus, { type: TagType; text: string }> = {
    intact: { type: 'intact', text: '完好' },
    worn: { type: 'worn', text: '磨耗' },
    fallen: { type: 'fallen', text: '脱落' },
    rebond: { type: 'rebond', text: '需重粘' }
  }
  const cfg = map[status]
  return <StatusTag type={cfg.type} text={cfg.text} />
}

export default StatusTag
