import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'
import type { Patient } from '@/types'

export interface PatientCardProps {
  patient: Patient
  showActions?: boolean
  onClick?: () => void
  onBondingClick?: () => void
  onFollowUpClick?: () => void
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onClick,
  showActions = false
}) => {
  const genderColor = patient.gender === '男' ? '#4080ff' : '#f759ab'

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          {patient.avatar ? (
            <Image className={styles.avatarImg} src={patient.avatar} mode="aspectFill" />
          ) : (
            <Text className={styles.avatarText}>{patient.name.charAt(0)}</Text>
          )}
        </View>
        <View className={styles.info}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{patient.name}</Text>
            <Text className={styles.gender} style={{ color: genderColor }}>
              {patient.gender} {patient.age}岁
            </Text>
          </View>
          <Text className={styles.caseNumber}>病历号：{patient.caseNumber}</Text>
        </View>
      </View>

      <View className={styles.meta}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>矫治阶段：</Text>
          <Text className={styles.metaValue}>{patient.treatmentStage}</Text>
        </View>
      </View>

      {patient.nextVisitDate && (
        <View className={styles.footer}>
          <Text className={styles.nextVisit}>
            下次复诊：<strong>{patient.nextVisitDate}</strong>
          </Text>
        </View>
      )}
    </View>
  )
}

export default PatientCard
